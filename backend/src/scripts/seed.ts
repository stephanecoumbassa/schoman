import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoman';

async function seed() {
  try {
    console.log('🌱 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Clear existing data
    console.log('🗑️  Suppression des données existantes...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});

    // Create admin user
    console.log('👤 Création de l\'administrateur...');
    const admin = await User.create({
      email: 'admin@schoman.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Principal',
      role: 'admin',
      phone: '0601020304',
    });

    // Create teacher user
    console.log('👨‍🏫 Création de l\'enseignant...');
    const teacher = await User.create({
      email: 'teacher@schoman.com',
      password: 'teacher123',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'teacher',
      phone: '0602030405',
    });

    // Create classes
    console.log('🏫 Création des classes...');
    const classCE1 = await Class.create({
      name: 'CE1-A',
      level: 'CE1',
      academicYear: '2024-2025',
      maxCapacity: 25,
      currentEnrollment: 0,
      mainTeacher: teacher._id,
      room: 'Salle 101',
    });

    const classCE2 = await Class.create({
      name: 'CE2-B',
      level: 'CE2',
      academicYear: '2024-2025',
      maxCapacity: 30,
      currentEnrollment: 0,
      room: 'Salle 102',
    });

    // Create student users and profiles
    console.log('👨‍🎓 Création des élèves...');
    
    const studentData = [
      {
        email: 'student@schoman.com',
        firstName: 'Pierre',
        lastName: 'Martin',
        studentNumber: 'STU2024001',
        dateOfBirth: new Date('2013-05-15'),
        placeOfBirth: 'Paris',
        gender: 'M',
        level: 'CE1',
        class: classCE1._id,
        parentContact: {
          name: 'Jean Martin',
          phone: '0612345678',
          email: 'j.martin@email.com',
          relationship: 'Père',
        },
        emergencyContact: {
          name: 'Sophie Martin',
          phone: '0698765432',
        },
      },
      {
        email: 'sophie.durand@schoman.com',
        firstName: 'Sophie',
        lastName: 'Durand',
        studentNumber: 'STU2024002',
        dateOfBirth: new Date('2012-08-22'),
        placeOfBirth: 'Lyon',
        gender: 'F',
        level: 'CE2',
        class: classCE2._id,
        parentContact: {
          name: 'Claire Durand',
          phone: '0623456789',
          email: 'c.durand@email.com',
          relationship: 'Mère',
        },
        emergencyContact: {
          name: 'Paul Durand',
          phone: '0687654321',
        },
      },
      {
        email: 'lucas.bernard@schoman.com',
        firstName: 'Lucas',
        lastName: 'Bernard',
        studentNumber: 'STU2024003',
        dateOfBirth: new Date('2013-02-10'),
        placeOfBirth: 'Marseille',
        gender: 'M',
        level: 'CE1',
        class: classCE1._id,
        parentContact: {
          name: 'Anne Bernard',
          phone: '0634567890',
          email: 'a.bernard@email.com',
          relationship: 'Mère',
        },
        emergencyContact: {
          name: 'Marc Bernard',
          phone: '0676543210',
        },
      },
      {
        email: 'emma.petit@schoman.com',
        firstName: 'Emma',
        lastName: 'Petit',
        studentNumber: 'STU2024004',
        dateOfBirth: new Date('2012-11-30'),
        placeOfBirth: 'Toulouse',
        gender: 'F',
        level: 'CE2',
        class: classCE2._id,
        parentContact: {
          name: 'Thomas Petit',
          phone: '0645678901',
          email: 't.petit@email.com',
          relationship: 'Père',
        },
        emergencyContact: {
          name: 'Julie Petit',
          phone: '0665432109',
        },
      },
      {
        email: 'maxime.roux@schoman.com',
        firstName: 'Maxime',
        lastName: 'Roux',
        studentNumber: 'STU2024005',
        dateOfBirth: new Date('2013-07-18'),
        placeOfBirth: 'Nice',
        gender: 'M',
        level: 'CE1',
        class: classCE1._id,
        parentContact: {
          name: 'Isabelle Roux',
          phone: '0656789012',
          email: 'i.roux@email.com',
          relationship: 'Mère',
        },
        emergencyContact: {
          name: 'François Roux',
          phone: '0654321098',
        },
      },
    ];

    for (const data of studentData) {
      const user = await User.create({
        email: data.email,
        password: 'student123',
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
      });

      await Student.create({
        userId: user._id,
        studentNumber: data.studentNumber,
        dateOfBirth: data.dateOfBirth,
        placeOfBirth: data.placeOfBirth,
        gender: data.gender,
        level: data.level,
        class: data.class,
        parentContact: data.parentContact,
        emergencyContact: data.emergencyContact,
      });
    }

    // Update class enrollment counts
    await Class.findByIdAndUpdate(classCE1._id, { currentEnrollment: 3 });
    await Class.findByIdAndUpdate(classCE2._id, { currentEnrollment: 2 });

    console.log('✅ Données de démonstration créées avec succès!');
    console.log('\n📋 Comptes disponibles:');
    console.log('   Admin: admin@schoman.com / admin123');
    console.log('   Enseignant: teacher@schoman.com / teacher123');
    console.log('   Élève: student@schoman.com / student123');
    console.log('\n🎉 Le système est prêt à être utilisé!');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB');
  }
}

seed();
