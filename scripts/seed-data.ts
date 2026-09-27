import 'dotenv/config';
import { db } from '../src/db';
import { auth } from '../src/lib/auth';
import {
  profiles,
  companies,
  companyMembers,
  jobPosts,
  events,
  eventSpeakers,
  eventRegistrations,
  experiencePosts,
  forms,
  formQuestions,
  formResponses,
  formAnswers,
  scholarshipCampaigns,
  donationPledges,
  scholarshipApplications,
  auditLogs,
  notifications,
  user,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting comprehensive data seed...');

  const seedUsers = [
    {
      email: 'admin@khoacntt.edu.vn',
      password: 'Password123!',
      name: 'TS. Nguyễn Văn Quản Trị',
      role: 'admin' as const,
      faculty: 'Công nghệ Thông tin',
      phone: '0901234567',
      bio: 'Quản trị viên trưởng hệ thống Khoa CNTT',
    },
    {
      email: 'staff@khoacntt.edu.vn',
      password: 'Password123!',
      name: 'ThS. Trần Thị Giáo Vụ',
      role: 'faculty_staff' as const,
      faculty: 'Công nghệ Thông tin',
      phone: '0902345678',
      bio: 'Phụ trách công tác Hợp tác Doanh nghiệp và Cựu sinh viên',
    },
    {
      email: 'alumni.le@gmail.com',
      password: 'Password123!',
      name: 'Lê Hoàng Nam',
      role: 'alumni' as const,
      faculty: 'Công nghệ Thông tin',
      batchYear: 2018,
      graduationYear: 2022,
      phone: '0903456789',
      bio: 'Tech Lead tại FPT Software | Cựu sinh viên K18',
    },
    {
      email: 'alumni.mai@gmail.com',
      password: 'Password123!',
      name: 'Vũ Thị Thanh Mai',
      role: 'alumni' as const,
      faculty: 'Công nghệ Thông tin',
      batchYear: 2017,
      graduationYear: 2021,
      phone: '0904567890',
      bio: 'Senior Product Manager tại VNG Corporation',
    },
    {
      email: 'student.hoa@khoacntt.edu.vn',
      password: 'Password123!',
      name: 'Nguyễn Tiến Hoa',
      role: 'student' as const,
      studentCode: '21110045',
      faculty: 'Công nghệ Thông tin',
      batchYear: 2021,
      phone: '0905678901',
      bio: 'Sinh viên năm cuối ngành Kỹ thuật Phần mềm, đam mê Web và AI',
    },
    {
      email: 'hr@vng.com.vn',
      password: 'Password123!',
      name: 'Phạm Thu Trang (HR VNG)',
      role: 'employer' as const,
      phone: '0906789012',
      bio: 'Chuyên viên tuyển dụng Nhân tài Công nghệ - VNG Corporation',
    },
    {
      email: 'hr@fpt.com.vn',
      password: 'Password123!',
      name: 'Đặng Tuấn Anh (HR FPT)',
      role: 'employer' as const,
      phone: '0907890123',
      bio: 'Head of Recruitment - FPT Software Global',
    },
  ];

  const createdUserMap: Record<string, string> = {};

  for (const u of seedUsers) {
    try {
      const [existing] = await db
        .select()
        .from(user)
        .where(eq(user.email, u.email))
        .limit(1);

      let userId = existing?.id;

      if (!userId) {
        const authRes = await auth.api.signUpEmail({
          body: {
            email: u.email,
            password: u.password,
            name: u.name,
          },
        });
        userId = authRes.user.id;
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`User ${u.email} already exists.`);
      }

      createdUserMap[u.email] = userId;

      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (!existingProfile) {
        await db.insert(profiles).values({
          userId,
          role: u.role,
          fullName: u.name,
          studentCode: (u as any).studentCode || null,
          faculty: (u as any).faculty || 'Công nghệ Thông tin',
          batchYear: (u as any).batchYear || null,
          graduationYear: (u as any).graduationYear || null,
          phone: u.phone,
          bio: u.bio,
          status: 'active',
        });
      }
    } catch (err: any) {
      console.warn(`Notice for ${u.email}:`, err.message);
    }
  }

  const adminId = createdUserMap['admin@khoacntt.edu.vn'];
  const staffId = createdUserMap['staff@khoacntt.edu.vn'];
  const alumni1Id = createdUserMap['alumni.le@gmail.com'];
  const alumni2Id = createdUserMap['alumni.mai@gmail.com'];
  const studentId = createdUserMap['student.hoa@khoacntt.edu.vn'];
  const hrVngId = createdUserMap['hr@vng.com.vn'];
  const hrFptId = createdUserMap['hr@fpt.com.vn'];

  // 2. Companies
  console.log('🏢 Seeding Companies...');
  let [vngCompany] = await db
    .select()
    .from(companies)
    .where(eq(companies.name, 'VNG Corporation'))
    .limit(1);

  if (!vngCompany && hrVngId) {
    const [c] = await db
      .insert(companies)
      .values({
        name: 'VNG Corporation',
        description: 'Tập đoàn công nghệ kỳ lân hàng đầu Việt Nam, phát triển Zalo, ZaloPay, Game Publishing...',
        industry: 'Internet & Phần mềm',
        website: 'https://vng.com.vn',
        logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200',
        verificationStatus: 'verified',
        createdBy: hrVngId,
        verifiedBy: staffId,
        verifiedAt: new Date(),
      })
      .returning();
    vngCompany = c;

    await db.insert(companyMembers).values({
      companyId: c.id,
      userId: hrVngId,
      roleInCompany: 'Lead Talent Acquisition',
      isActiveContext: true,
    });
  }

  let [fptCompany] = await db
    .select()
    .from(companies)
    .where(eq(companies.name, 'FPT Software'))
    .limit(1);

  if (!fptCompany && hrFptId) {
    const [c] = await db
      .insert(companies)
      .values({
        name: 'FPT Software',
        description: 'Công ty xuất khẩu phần mềm lớn nhất Việt Nam với hơn 30.000 kỹ sư trên toàn cầu.',
        industry: 'Gia công & Dịch vụ CNTT',
        website: 'https://fptsoftware.com',
        logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200',
        verificationStatus: 'verified',
        createdBy: hrFptId,
        verifiedBy: staffId,
        verifiedAt: new Date(),
      })
      .returning();
    fptCompany = c;

    await db.insert(companyMembers).values({
      companyId: c.id,
      userId: hrFptId,
      roleInCompany: 'Senior Recruiter',
      isActiveContext: true,
    });
  }

  // 3. Job Posts
  console.log('💼 Seeding Job Posts...');
  if (vngCompany && fptCompany) {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const jobsData = [
      {
        companyId: vngCompany.id,
        title: 'Thực tập sinh Frontend React/Next.js (Fresher/Intern)',
        description: 'Tham gia phát triển các sản phẩm web quy mô hàng triệu người dùng tại VNG Campus.',
        requirements: 'Nắm vững JavaScript/TypeScript, React cơ bản. Ham học hỏi, tư duy logic tốt.',
        location: 'VNG Campus, Quận 7, TP.HCM',
        jobType: 'internship' as const,
        salaryRange: '8.000.000 - 12.000.000 VNĐ/tháng',
        applyUrlOrEmail: 'recruitment@vng.com.vn',
        status: 'approved' as const,
        reviewedBy: staffId,
        reviewedAt: new Date(),
        expiresAt: in30Days,
      },
      {
        companyId: vngCompany.id,
        title: 'Backend Engineer (Node.js/Go) - ZaloPay Team',
        description: 'Xây dựng hệ thống microservices xử lý hàng chục nghìn giao dịch mỗi giây.',
        requirements: 'Tối thiểu 1 năm kinh nghiệm Backend. Hiểu biết về Redis, Kafka, PostgreSQL.',
        location: 'TP.HCM (Hybrid)',
        jobType: 'full_time' as const,
        salaryRange: '20.000.000 - 35.000.000 VNĐ',
        applyUrlOrEmail: 'talents@vng.com.vn',
        status: 'approved' as const,
        reviewedBy: staffId,
        reviewedAt: new Date(),
        expiresAt: in30Days,
      },
      {
        companyId: fptCompany.id,
        title: 'Kỹ sư Trí tuệ Nhân tạo (AI/LLM Engineer)',
        description: 'Nghiên cứu và triển khai các giải pháp AI Agents, RAG cho khách hàng tại Nhật Bản & Mỹ.',
        requirements: 'Thành thạo Python, PyTorch/TensorFlow, kinh nghiệm prompt engineering và vector DB.',
        location: 'Khu Công Nghệ Cao, TP. Thủ Đức',
        jobType: 'full_time' as const,
        salaryRange: '25.000.000 - 45.000.000 VNĐ',
        applyUrlOrEmail: 'fpt-careers@fpt.com',
        status: 'approved' as const,
        reviewedBy: staffId,
        reviewedAt: new Date(),
        expiresAt: in30Days,
      },
    ];

    for (const j of jobsData) {
      const [existingJob] = await db
        .select()
        .from(jobPosts)
        .where(eq(jobPosts.title, j.title))
        .limit(1);
      if (!existingJob) {
        await db.insert(jobPosts).values(j);
      }
    }
  }

  // 4. Events
  console.log('🎤 Seeding Events...');
  if (staffId && alumni1Id && alumni2Id) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setHours(nextWeekEnd.getHours() + 3);

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.title, 'Talkshow Cựu Sinh Viên: Hành trang phỏng vấn Big Tech & Startup 2026'))
      .limit(1);

    if (!existingEvent) {
      const [ev] = await db
        .insert(events)
        .values({
          type: 'talkshow',
          title: 'Talkshow Cựu Sinh Viên: Hành trang phỏng vấn Big Tech & Startup 2026',
          description: 'Buổi chia sẻ thân mật cùng các cựu sinh viên K17, K18 đang làm việc tại các tập đoàn công nghệ lớn. Bí quyết vượt qua vòng Coding Interview và System Design.',
          format: 'offline',
          locationOrLink: 'Hội trường A, Tòa nhà Trung tâm, ĐHQG',
          startTime: nextWeek,
          endTime: nextWeekEnd,
          capacity: 200,
          status: 'published',
          coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          createdBy: staffId,
        })
        .returning();

      await db.insert(eventSpeakers).values([
        {
          eventId: ev.id,
          alumniUserId: alumni1Id,
          invitationStatus: 'accepted',
          note: 'Chia sẻ chủ đề: Lộ trình từ Thực tập sinh lên Tech Lead',
        },
        {
          eventId: ev.id,
          alumniUserId: alumni2Id,
          invitationStatus: 'accepted',
          note: 'Chia sẻ chủ đề: Kỹ năng mềm & Quản trị kỳ vọng trong môi trường Agile',
        },
      ]);

      if (studentId) {
        await db.insert(eventRegistrations).values({
          eventId: ev.id,
          userId: studentId,
          attendanceStatus: 'registered',
        });
      }
    }
  }

  // 5. Experience Posts
  console.log('📝 Seeding Experience Posts...');
  if (alumni1Id) {
    const [existing] = await db
      .select()
      .from(experiencePosts)
      .where(eq(experiencePosts.title, 'Lời khuyên từ cựu sinh viên K18: Những điều bạn nên làm trước khi tốt nghiệp ngành CNTT'))
      .limit(1);

    if (!existing) {
      await db.insert(experiencePosts).values({
        authorId: alumni1Id,
        title: 'Lời khuyên từ cựu sinh viên K18: Những điều bạn nên làm trước khi tốt nghiệp ngành CNTT',
        content: `Chào các bạn sinh viên Khoa CNTT,

Thấm thoát đã 4 năm kể từ ngày mình tốt nghiệp. Nhìn lại quãng thời gian đại học và hành trình đi làm, mình muốn đúc kết 3 điều quan trọng nhất:

1. Đừng chỉ học lý thuyết - hãy làm dự án thật (Side Projects): Nhà tuyển dụng ấn tượng nhất với các bạn có GitHub active và dự án giải quyết được bài toán thực tế.
2. Xây dựng network với Thầy Cô, Cựu sinh viên: Rất nhiều cơ hội việc làm tốt đến từ sự giới thiệu nội bộ (Referral).
3. Ngoại ngữ và kỹ năng giao tiếp: Viết code giỏi đưa bạn qua cửa, nhưng giao tiếp tốt mới giúp bạn thăng tiến.

Chúc các bạn khóa sau gặt hái thật nhiều thành công!`,
        tags: ['Kinh nghiệm', 'Phỏng vấn', 'Lộ trình sự nghiệp', 'Fresher'],
        status: 'published',
        viewCount: 142,
        publishedAt: new Date(),
      });
    }
  }

  // 6. Form Builder & Survey
  console.log('📋 Seeding Form Builder & Surveys...');
  if (staffId) {
    const [existingForm] = await db
      .select()
      .from(forms)
      .where(eq(forms.title, 'Khảo sát tình hình việc làm cựu sinh viên sau tốt nghiệp (K16 - K18)'))
      .limit(1);

    if (!existingForm) {
      const surveyDeadline = new Date();
      surveyDeadline.setDate(surveyDeadline.getDate() + 45);

      const [f] = await db
        .insert(forms)
        .values({
          type: 'survey',
          title: 'Khảo sát tình hình việc làm cựu sinh viên sau tốt nghiệp (K16 - K18)',
          description: 'Khảo sát nhằm thống kê tỷ lệ việc làm, mức lương khởi điểm và mức độ đáp ứng của chương trình đào tạo Khoa CNTT.',
          targetBatches: [2016, 2017, 2018],
          targetRole: 'alumni',
          deadline: surveyDeadline,
          status: 'open',
          createdBy: staffId,
        })
        .returning();

      await db.insert(formQuestions).values([
        {
          formId: f.id,
          orderIndex: 0,
          questionType: 'single_choice',
          label: 'Tình trạng việc làm hiện tại của bạn:',
          options: ['Đang có việc làm đúng chuyên ngành', 'Đang có việc làm liên quan', 'Đang tự khởi nghiệp / Freelancer', 'Đang học lên cao học', 'Chưa có việc làm'],
          isRequired: true,
        },
        {
          formId: f.id,
          orderIndex: 1,
          questionType: 'single_choice',
          label: 'Mức thu nhập hàng tháng (VNĐ):',
          options: ['Dưới 15 triệu', '15 - 25 triệu', '25 - 40 triệu', 'Trên 40 triệu'],
          isRequired: true,
        },
        {
          formId: f.id,
          orderIndex: 2,
          questionType: 'scale',
          label: 'Mức độ hài lòng với kiến thức được đào tạo tại Khoa (1 - 5):',
          isRequired: true,
          config: { min: 1, max: 5, minLabel: '1 - Kém', maxLabel: '5 - Xuất sắc' },
        },
      ]);
    }
  }

  // 7. Scholarship Campaign
  console.log('🎓 Seeding Scholarship Campaign & Fund...');
  if (staffId && alumni1Id && hrVngId) {
    let [campaign] = await db
      .select()
      .from(scholarshipCampaigns)
      .where(eq(scholarshipCampaigns.title, 'Quỹ Học bổng Thắp sáng Tài năng Trẻ Khoa CNTT - Học kỳ 1 (2026)'))
      .limit(1);

    if (!campaign) {
      const scholarshipDeadline = new Date();
      scholarshipDeadline.setDate(scholarshipDeadline.getDate() + 60);

      const [c] = await db
        .insert(scholarshipCampaigns)
        .values({
          title: 'Quỹ Học bổng Thắp sáng Tài năng Trẻ Khoa CNTT - Học kỳ 1 (2026)',
          description: 'Hỗ trợ sinh viên có hoàn cảnh khó khăn đạt thành tích học tập tốt, tiếp sức ước mơ công nghệ.',
          targetAmount: '100000000',
          currentAmount: '35000000',
          applicationDeadline: scholarshipDeadline,
          status: 'open',
          createdBy: staffId,
        })
        .returning();
      campaign = c;

      await db.insert(donationPledges).values([
        {
          campaignId: c.id,
          donorId: alumni1Id,
          donorDisplayName: 'Lê Hoàng Nam (Alumni K18)',
          isAnonymous: false,
          amount: '15000000',
          status: 'fulfilled',
          note: 'Ủng hộ các đàn em khóa dưới vượt khó vươn lên',
          createdBy: alumni1Id,
        },
        {
          campaignId: c.id,
          donorId: hrVngId,
          donorDisplayName: 'Tập đoàn VNG',
          isAnonymous: false,
          amount: '20000000',
          status: 'fulfilled',
          note: 'Tài trợ học bổng nuôi dưỡng tài năng trẻ IT',
          createdBy: hrVngId,
        },
        {
          campaignId: c.id,
          donorId: alumni2Id,
          donorDisplayName: 'Cựu sinh viên K17 (Ẩn danh)',
          isAnonymous: true,
          amount: '10000000',
          status: 'pledged',
          note: 'Sẽ chuyển khoản vào tài khoản trường trong tuần tới',
          createdBy: alumni2Id,
        },
      ]);

      if (studentId) {
        await db.insert(scholarshipApplications).values({
          campaignId: c.id,
          studentId: studentId,
          status: 'reviewing',
          score: '88.5',
          reviewNote: 'Hoàn cảnh gia đình khó khăn, GPA 3.6/4.0 xuất sắc, nhiệt tình tham gia hoạt động Đoàn - Hội.',
          reviewedBy: staffId,
        });
      }
    }
  }

  // 8. Audit Log
  if (adminId) {
    await db.insert(auditLogs).values({
      actorId: adminId,
      action: 'system_initialize',
      entityType: 'system',
      entityId: adminId,
      metadata: { version: '1.0.0', initializedAt: new Date().toISOString() },
    });
  }

  console.log('✅ Comprehensive seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 ACCOUNTS READY TO TEST & DEMO:');
  console.log('1. Admin:         admin@khoacntt.edu.vn       / Password123!');
  console.log('2. Faculty Staff: staff@khoacntt.edu.vn       / Password123!');
  console.log('3. Alumni:        alumni.le@gmail.com         / Password123!');
  console.log('4. Student:       student.hoa@khoacntt.edu.vn / Password123!');
  console.log('5. Employer:      hr@vng.com.vn               / Password123!');
  console.log('----------------------------------------------------');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
