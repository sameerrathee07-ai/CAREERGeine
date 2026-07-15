import { db, Timestamp } from '../config/firebase.js';
import { getDocument } from '../services/firestore.js';
import logger from '../services/logger.js';

export async function getStudentDashboard(req, res, next) {
  try {
    const uid = req.user.uid;

    const [userDoc, resumesSnap, appsSnap, savedSnap, notifSnap] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('resumes').where('userId', '==', uid).orderBy('createdAt', 'desc').limit(5).get(),
      db.collection('applications').where('userId', '==', uid).orderBy('createdAt', 'desc').limit(10).get(),
      db.collection('savedJobs').where('userId', '==', uid).count().get(),
      db.collection('notifications').where('userId', '==', uid).where('read', '==', false).count().get(),
    ]);

    const user = userDoc.data();
    const resumes = resumesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const applications = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Latest resume score
    const latestResume = resumes.find((r) => r.status === 'completed');
    const resumeScore = latestResume?.analysis?.resumeScore || 0;
    const atsScore = latestResume?.analysis?.atsScore || 0;

    // Application stats
    const appStats = { total: applications.length, pending: 0, reviewing: 0, accepted: 0, rejected: 0 };
    applications.forEach((a) => { if (appStats[a.status] !== undefined) appStats[a.status]++; });

    res.json({
      success: true,
      data: {
        profile: { name: user.name, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio },
        stats: {
          resumeScore,
          atsScore,
          applications: appStats,
          savedJobs: savedSnap.data().count,
          resumesUploaded: user.stats?.resumesUploaded || 0,
          unreadNotifications: notifSnap.data().count,
          profileCompletion: calculateProfileCompletion(user),
        },
        recentResumes: resumes,
        recentApplications: applications,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecruiterDashboard(req, res, next) {
  try {
    const uid = req.user.uid;

    const [userDoc, jobsSnap, appsSnap, notifSnap] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('jobs').where('recruiterId', '==', uid).orderBy('createdAt', 'desc').limit(10).get(),
      db.collection('notifications').where('userId', '==', uid).where('read', '==', false).count().get(),
    ]);

    const user = userDoc.data();
    const jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const jobIds = jobs.map((j) => j.id);

    // Get applications for all recruiter's jobs
    let applications = [];
    if (jobIds.length > 0) {
      // Firestore 'in' limited to 10
      for (let i = 0; i < jobIds.length; i += 10) {
        const batch = jobIds.slice(i, i + 10);
        const snap = await db.collection('applications').where('jobId', 'in', batch).get();
        applications.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    }

    const appStats = { total: applications.length, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 };
    applications.forEach((a) => { if (appStats[a.status] !== undefined) appStats[a.status]++; });

    // Recent applicants (last 5)
    const recentApplicants = applications.slice(-5).reverse();

    // Enrich recent applicants with user data
    const enrichedApplicants = await Promise.all(recentApplicants.map(async (app) => {
      try {
        const userDoc = await db.collection('users').doc(app.userId).get();
        const u = userDoc.data();
        const job = jobs.find((j) => j.id === app.jobId);
        return { ...app, applicantName: u?.name || u?.email || 'Unknown', jobTitle: job?.title || 'Unknown' };
      } catch {
        return app;
      }
    }));

    res.json({
      success: true,
      data: {
        profile: { name: user.name, email: user.email, company: user.company, avatarUrl: user.avatarUrl },
        stats: {
          totalJobs: jobs.length,
          activeJobs: jobs.filter((j) => j.status === 'active').length,
          totalApplications: appStats.total,
          pendingApplications: appStats.pending,
          shortlisted: appStats.shortlisted,
          accepted: appStats.accepted,
          unreadNotifications: notifSnap.data().count,
        },
        recentJobs: jobs.slice(0, 5),
        recentApplicants: enrichedApplicants,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminDashboard(req, res, next) {
  try {
    const [
      usersCount, recruitersCount, studentsCount,
      jobsCount, resumesCount, appsCount,
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('role', '==', 'recruiter').count().get(),
      db.collection('users').where('role', '==', 'student').count().get(),
      db.collection('jobs').count().get(),
      db.collection('resumes').count().get(),
      db.collection('applications').count().get(),
    ]);

    // Recent signups (last 10)
    const recentUsersSnap = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    const recentUsers = recentUsersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Monthly growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySnap = await db.collection('users')
      .where('createdAt', '>=', Timestamp.fromDate(sixMonthsAgo))
      .orderBy('createdAt', 'asc')
      .get();

    const monthlyGrowth = {};
    monthlySnap.docs.forEach((d) => {
      const date = d.data().createdAt?.toDate() || new Date();
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyGrowth[key] = (monthlyGrowth[key] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: usersCount.data().count,
          totalStudents: studentsCount.data().count,
          totalRecruiters: recruitersCount.data().count,
          totalJobs: jobsCount.data().count,
          totalResumes: resumesCount.data().count,
          totalApplications: appsCount.data().count,
        },
        monthlyGrowth,
        recentUsers: recentUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

function calculateProfileCompletion(user) {
  if (!user) return 0;
  let score = 0;
  if (user.name) score += 25;
  if (user.email) score += 15;
  if (user.bio) score += 20;
  if (user.avatarUrl) score += 15;
  if (user.phone) score += 10;
  if (user.preferences) score += 15;
  return Math.min(100, score);
}
