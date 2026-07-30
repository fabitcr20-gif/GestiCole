import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@gesticole.local";

async function main() {
  const teacher = await prisma.teacher.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Profesor(a) Demo",
    },
  });

  const existing = await prisma.section.findFirst({
    where: { teacherId: teacher.id },
  });
  if (existing) {
    console.log("Ya existen datos de ejemplo, no se vuelve a sembrar.");
    return;
  }

  const section = await prisma.section.create({
    data: {
      teacherId: teacher.id,
      name: "7-2",
      subject: "Matemática",
      level: "Sétimo año",
      year: 2026,
      color: "#2563eb",
      gradeComponents: {
        create: [
          { name: "Cotidiano", weight: 20, period: "I", order: 0 },
          { name: "Tareas", weight: 15, period: "I", order: 1 },
          { name: "Pruebas", weight: 40, period: "I", order: 2 },
          { name: "Proyecto", weight: 20, period: "I", order: 3 },
          { name: "Asistencia", weight: 5, period: "I", order: 4 },
        ],
      },
      students: {
        create: [
          { fullName: "Ana Brenes Solano", studentCode: "202601", order: 0 },
          { fullName: "Bryan Castro Vargas", studentCode: "202602", order: 1 },
          { fullName: "Carla Delgado Mora", studentCode: "202603", order: 2 },
          { fullName: "Diego Esquivel Rojas", studentCode: "202604", order: 3 },
          { fullName: "Elena Fernández Ureña", studentCode: "202605", order: 4 },
        ],
      },
    },
    include: { gradeComponents: true, students: true },
  });

  const grades = [];
  for (const student of section.students) {
    for (const component of section.gradeComponents) {
      grades.push({
        studentId: student.id,
        componentId: component.id,
        sectionId: section.id,
        score: Math.round((70 + Math.random() * 30) * 10) / 10,
      });
    }
  }
  await prisma.grade.createMany({ data: grades });

  await prisma.lessonPlan.create({
    data: {
      teacherId: teacher.id,
      sectionId: section.id,
      title: "Introducción a las fracciones",
      unit: "Números racionales",
      objectives: "Identificar y representar fracciones en contextos cotidianos.",
      strategies:
        "Trabajo colaborativo en grupos, uso de material concreto (fichas y círculos fraccionarios), resolución de problemas.",
      evaluationCriteria:
        "Representa fracciones equivalentes. Resuelve problemas contextualizados con fracciones.",
      resources: "Fichas de fracciones, hojas de trabajo, pizarra.",
    },
  });

  await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      sectionId: section.id,
      title: "Prueba corta - Fracciones",
      subject: "Matemática",
      instructions: "Responda de forma clara y ordenada. Se permite el uso de calculadora.",
      totalPoints: 20,
      questions: [
        { type: "desarrollo", prompt: "Represente 3/4 de forma gráfica.", points: 5 },
        { type: "seleccion", prompt: "¿Cuál fracción es equivalente a 1/2?", points: 5, options: ["2/4", "1/3", "3/5", "2/3"] },
        { type: "desarrollo", prompt: "Resuelva: 2/3 + 1/6", points: 10 },
      ],
    },
  });

  console.log(`Datos de ejemplo creados para ${teacher.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
