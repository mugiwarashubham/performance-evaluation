require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Company = require('../models/company');
const User = require('../models/User');
const FeedbackCycle = require('../models/feedback');
const FeedbackAssignment = require('../models/FeedbackAssignment');
const FeedbackSubmission = require('../models/FeedbackSubmission');
const PARAMETERS = require('../config/parameters');

const CURRENT_MONTH = 8;
const CURRENT_YEAR = 2026;

// Creates an assignment for a cycle, and optionally a matching submission
// (used to pre-fill last cycle's history so the "employee trend" view has
// something to show on day one).
const makeAssignment = async (companyId, cycleId, managerId, employeeId, submitted) => {
  const assignment = await FeedbackAssignment.create({
    companyId,
    cycleId,
    managerId,
    employeeId,
    status: submitted ? 'submitted' : 'pending',
    submittedAt: submitted ? new Date() : null
  });

  if (submitted) {
    await FeedbackSubmission.create({
      companyId,
      cycleId,
      managerId,
      employeeId,
      ratings: PARAMETERS.map((p) => ({
        parameterName: p,
        score: Math.floor(Math.random() * 2) + 3, // 3 or 4
        reason: `Consistently solid on ${p.toLowerCase()} this cycle.`
      })),
      comment: 'Good progress this month — keep it up.'
    });
  }

  return assignment;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await FeedbackSubmission.deleteMany({});
    await FeedbackAssignment.deleteMany({});
    await FeedbackCycle.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});

    const password = await bcrypt.hash('password123', 10);

    // ---------------------------------------------------------------
    // Ashoka Textiles
    // Hierarchy: COO -> Rohan -> Priya -> 6 direct reports.
    // Kavita is HR: no place in the reporting chain, monitors everyone.
    // ---------------------------------------------------------------
    const ashoka = await Company.create({ name: 'Ashoka Textiles' });

    const kavita = await User.create({
      companyId: ashoka._id,
      name: 'Kavita',
      email: 'kavita@ashoka.com',
      password,
      role: 'hr'
    });

    const coo = await User.create({
      companyId: ashoka._id,
      name: 'Suresh',
      email: 'coo@ashoka.com',
      password,
      role: 'employee',
      managerId: null
    });

    const rohan = await User.create({
      companyId: ashoka._id,
      name: 'Rohan',
      email: 'rohan@ashoka.com',
      password,
      role: 'employee',
      managerId: coo._id
    });

    const priya = await User.create({
      companyId: ashoka._id,
      name: 'Priya',
      email: 'priya@ashoka.com',
      password,
      role: 'employee',
      managerId: rohan._id
    });

    const ashokaEmployees = await User.insertMany(
      ['Amit', 'Neha', 'Vikram', 'Sana', 'Farhan', 'Divya'].map((name) => ({
        companyId: ashoka._id,
        name,
        email: `${name.toLowerCase()}@ashoka.com`,
        password,
        role: 'employee',
        managerId: priya._id
      }))
    );

    // ---------------------------------------------------------------
    // Bright Path Consulting
    // Hierarchy: Founder -> 8 direct reports, no middle layer.
    // ---------------------------------------------------------------
    const brightPath = await Company.create({ name: 'Bright Path Consulting' });

    const founder = await User.create({
      companyId: brightPath._id,
      name: 'Founder',
      email: 'founder@brightpath.com',
      password,
      role: 'employee',
      managerId: null
    });

    const brightEmployees = await User.insertMany(
      ['Arjun', 'Meera', 'Kabir', 'Zoya', 'Ishaan', 'Ananya', 'Dev', 'Riya'].map(
        (name) => ({
          companyId: brightPath._id,
          name,
          email: `${name.toLowerCase()}@brightpath.com`,
          password,
          role: 'employee',
          managerId: founder._id
        })
      )
    );

    // ---------------------------------------------------------------
    // Cycles: a closed previous month (with submissions, for history) and
    // an open current month (still pending, for the demo flows).
    // ---------------------------------------------------------------
    const cyclesByCompany = {};

    for (const company of [ashoka, brightPath]) {
      const prev = await FeedbackCycle.create({
        companyId: company._id,
        month: CURRENT_MONTH - 1,
        year: CURRENT_YEAR,
        status: 'closed'
      });

      const current = await FeedbackCycle.create({
        companyId: company._id,
        month: CURRENT_MONTH,
        year: CURRENT_YEAR,
        status: 'open'
      });

      cyclesByCompany[company._id] = { prev, current };
    }

    const ashokaPairs = [
      [coo._id, rohan._id],
      [rohan._id, priya._id],
      ...ashokaEmployees.map((e) => [priya._id, e._id])
    ];

    const brightPairs = brightEmployees.map((e) => [founder._id, e._id]);

    for (const [managerId, employeeId] of ashokaPairs) {
      await makeAssignment(
        ashoka._id,
        cyclesByCompany[ashoka._id].prev._id,
        managerId,
        employeeId,
        true
      );
      await makeAssignment(
        ashoka._id,
        cyclesByCompany[ashoka._id].current._id,
        managerId,
        employeeId,
        false
      );
    }

    for (const [managerId, employeeId] of brightPairs) {
      await makeAssignment(
        brightPath._id,
        cyclesByCompany[brightPath._id].prev._id,
        managerId,
        employeeId,
        true
      );
      await makeAssignment(
        brightPath._id,
        cyclesByCompany[brightPath._id].current._id,
        managerId,
        employeeId,
        false
      );
    }

    console.log('Seed completed successfully');
    console.log('All seeded users share the password: password123');
    console.log('Try: kavita@ashoka.com (HR), priya@ashoka.com (mid-chain manager+employee), founder@brightpath.com (flat structure)');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
