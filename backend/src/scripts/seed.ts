import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Invoice from '../models/Invoice.js';

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
    await Book.deleteMany({});
    await Loan.deleteMany({});
    await Invoice.deleteMany({});

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

    const students = [];
    for (const data of studentData) {
      const user = await User.create({
        email: data.email,
        password: 'student123',
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
      });

      const student = await Student.create({
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
      students.push(student);
    }

    // Update class enrollment counts
    await Class.findByIdAndUpdate(classCE1._id, { currentEnrollment: 3 });
    await Class.findByIdAndUpdate(classCE2._id, { currentEnrollment: 2 });

    // Create books
    console.log('📚 Création des livres...');
    const books = await Book.insertMany([
      {
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        isbn: '978-2070612758',
        category: 'Littérature',
        publisher: 'Gallimard',
        publishedYear: 1943,
        description: 'Un conte philosophique et poétique',
        totalQuantity: 3,
        availableQuantity: 3,
        location: 'Étagère A1',
      },
      {
        title: 'Harry Potter à l\'école des sorciers',
        author: 'J.K. Rowling',
        isbn: '978-2070584628',
        category: 'Jeunesse',
        publisher: 'Gallimard',
        publishedYear: 1997,
        description: 'Premier tome de la saga Harry Potter',
        totalQuantity: 5,
        availableQuantity: 4,
        location: 'Étagère B2',
      },
      {
        title: 'Le Voyage au centre de la Terre',
        author: 'Jules Verne',
        isbn: '978-2253006299',
        category: 'Science-Fiction',
        publisher: 'Le Livre de Poche',
        publishedYear: 1864,
        description: 'Une aventure extraordinaire',
        totalQuantity: 2,
        availableQuantity: 2,
        location: 'Étagère C3',
      },
      {
        title: 'Le Livre de la jungle',
        author: 'Rudyard Kipling',
        isbn: '978-2070612796',
        category: 'Jeunesse',
        publisher: 'Gallimard',
        publishedYear: 1894,
        description: 'Les aventures de Mowgli',
        totalQuantity: 4,
        availableQuantity: 4,
        location: 'Étagère A2',
      },
      {
        title: 'Les Misérables',
        author: 'Victor Hugo',
        isbn: '978-2253096337',
        category: 'Littérature',
        publisher: 'Le Livre de Poche',
        publishedYear: 1862,
        description: 'Un chef-d\'œuvre de la littérature française',
        totalQuantity: 2,
        availableQuantity: 2,
        location: 'Étagère D1',
      },
      {
        title: 'Le Lion',
        author: 'Joseph Kessel',
        isbn: '978-2070360154',
        category: 'Aventure',
        publisher: 'Gallimard',
        publishedYear: 1958,
        description: 'Une histoire captivante au Kenya',
        totalQuantity: 3,
        availableQuantity: 3,
        location: 'Étagère B1',
      },
    ]);

    // Create a sample loan
    console.log('📖 Création d\'un emprunt exemple...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    
    await Loan.create({
      book: books[1]._id, // Harry Potter
      student: students[0]._id, // First student
      borrowDate: new Date(),
      dueDate: futureDate,
      status: 'borrowed',
      notes: 'Premier emprunt de l\'année',
    });

    // Update book availability
    await Book.findByIdAndUpdate(books[1]._id, {
      availableQuantity: 4,
    });

    // Create sample invoices
    console.log('💰 Création des factures exemple...');
    
    // Invoice for first student - Paid
    const invoice1DueDate = new Date();
    invoice1DueDate.setDate(invoice1DueDate.getDate() + 30);
    
    await Invoice.create({
      invoiceNumber: 'INV-2024-00001',
      student: students[0]._id,
      items: [
        {
          description: 'Frais de scolarité - Trimestre 1',
          category: 'tuition',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        },
        {
          description: 'Fournitures scolaires',
          category: 'material',
          quantity: 1,
          unitPrice: 25000,
          totalPrice: 25000,
        },
      ],
      subtotal: 175000,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 175000,
      issueDate: new Date('2024-09-01'),
      dueDate: new Date('2024-09-30'),
      status: 'paid',
      paymentDate: new Date('2024-09-15'),
      paymentMethod: 'bank_transfer',
      paymentReference: 'TRX-2024-001',
    });

    // Invoice for second student - Sent (not paid yet)
    await Invoice.create({
      invoiceNumber: 'INV-2024-00002',
      student: students[1]._id,
      items: [
        {
          description: 'Frais de scolarité - Trimestre 1',
          category: 'tuition',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        },
      ],
      subtotal: 150000,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 150000,
      issueDate: new Date(),
      dueDate: invoice1DueDate,
      status: 'sent',
    });

    // Invoice for third student - Draft
    const invoice3DueDate = new Date();
    invoice3DueDate.setDate(invoice3DueDate.getDate() + 45);
    
    await Invoice.create({
      invoiceNumber: 'INV-2024-00003',
      student: students[2]._id,
      items: [
        {
          description: 'Frais de scolarité - Trimestre 1',
          category: 'tuition',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        },
        {
          description: 'Transport scolaire',
          category: 'transport',
          quantity: 1,
          unitPrice: 30000,
          totalPrice: 30000,
        },
        {
          description: 'Cantine',
          category: 'cafeteria',
          quantity: 1,
          unitPrice: 20000,
          totalPrice: 20000,
        },
      ],
      subtotal: 200000,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 200000,
      issueDate: new Date(),
      dueDate: invoice3DueDate,
      status: 'draft',
    });

    console.log('✅ Données de démonstration créées avec succès!');
    console.log('\n📋 Comptes disponibles:');
    console.log('   Admin: admin@schoman.com / admin123');
    console.log('   Enseignant: teacher@schoman.com / teacher123');
    console.log('   Élève: student@schoman.com / student123');
    console.log('\n📚 Livres créés: 6 livres avec 19 exemplaires au total');
    console.log('📖 Emprunts: 1 emprunt en cours');
    console.log('💰 Factures créées: 3 factures (1 payée, 1 envoyée, 1 brouillon)');
    console.log('\n🎉 Le système est prêt à être utilisé!');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB');
  }
}

seed();
