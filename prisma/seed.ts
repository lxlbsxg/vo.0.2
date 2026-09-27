import { prisma } from "../lib/prisma";

async function main() {
  const person = await prisma.person.create({ data: { name: "测试企业主" } });
  const company = await prisma.company.create({
    data: {
      ownerId: person.id,
      name: "示例科技有限公司",
      description: "一个用于验证页面的示例企业。",
      verification: "VERIFIED",
    },
  });
  const chapter = await prisma.chapter.create({
    data: {
      companyId: company.id,
      title: "示例 Chapter：新产品发布",
      body: "本 Chapter 用于验证首页/详情页/企业页的完整链路。",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          {
            description: "完成产品原型",
            isDecisiveVictory: false,
            plannedAnnounceAt: new Date(),
          },
          {
            description: "达成 1000 用户",
            isDecisiveVictory: true,
            plannedAnnounceAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });
  console.log({ personId: person.id, companyId: company.id, chapterId: chapter.id });
}

main().finally(() => prisma.$disconnect());
