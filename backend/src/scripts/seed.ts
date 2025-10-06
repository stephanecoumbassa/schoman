import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Invoice from '../models/Invoice.js';
import Event from '../models/Event.js';
import Expense from '../models/Expense.js';
import Message from '../models/Message.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { v4 as uuidv4 } from 'uuid';

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
    await Event.deleteMany({});
    await Expense.deleteMany({});
    await Message.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});

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

    // Create events
    console.log('📆 Création des événements exemple...');
    
    const event1Date = new Date();
    event1Date.setDate(event1Date.getDate() + 7);
    const event1EndDate = new Date(event1Date);
    event1EndDate.setHours(event1EndDate.getHours() + 2);
    
    await Event.create({
      title: 'Réunion parents-professeurs',
      description: 'Rencontre trimestrielle avec les parents pour discuter des progrès des élèves',
      eventType: 'meeting',
      startDate: event1Date,
      endDate: event1EndDate,
      location: 'Salle polyvalente',
      organizer: teacher._id,
      targetAudience: ['parents', 'teachers'],
      classes: [classCE1._id, classCE2._id],
      status: 'planned',
      createdBy: admin._id,
    });

    const event2Date = new Date();
    event2Date.setDate(event2Date.getDate() + 14);
    const event2EndDate = new Date(event2Date);
    event2EndDate.setHours(event2EndDate.getHours() + 4);
    
    await Event.create({
      title: 'Fête de fin d\'année',
      description: 'Célébration de fin d\'année scolaire avec spectacles et activités',
      eventType: 'celebration',
      startDate: event2Date,
      endDate: event2EndDate,
      location: 'Cour de l\'école',
      organizer: admin._id,
      targetAudience: ['all'],
      maxParticipants: 200,
      currentParticipants: 0,
      status: 'planned',
      createdBy: admin._id,
    });

    const event3Date = new Date();
    event3Date.setDate(event3Date.getDate() + 21);
    const event3EndDate = new Date(event3Date);
    event3EndDate.setDate(event3EndDate.getDate() + 1);
    
    await Event.create({
      title: 'Sortie pédagogique au musée',
      description: 'Visite guidée du musée des sciences et de la technologie',
      eventType: 'outing',
      startDate: event3Date,
      endDate: event3EndDate,
      location: 'Musée des Sciences',
      organizer: teacher._id,
      targetAudience: ['students', 'teachers'],
      classes: [classCE1._id],
      maxParticipants: 30,
      currentParticipants: 0,
      status: 'planned',
      createdBy: teacher._id,
    });

    // Create expenses
    console.log('📉 Création des dépenses exemple...');
    
    await Expense.create({
      expenseNumber: 'EXP-2024-00001',
      title: 'Fournitures scolaires - Trimestre 1',
      description: 'Achat de cahiers, stylos, et matériel pédagogique',
      category: 'supplies',
      amount: 150000,
      expenseDate: new Date(),
      supplier: 'Papeterie du Centre',
      supplierContact: '0601111111',
      status: 'paid',
      paymentDate: new Date(),
      paymentMethod: 'bank_transfer',
      paymentReference: 'TRANS-2024-001',
      approvedBy: admin._id,
      approvalDate: new Date(),
      createdBy: teacher._id,
    });

    const expense2Date = new Date();
    expense2Date.setDate(expense2Date.getDate() - 7);
    
    await Expense.create({
      expenseNumber: 'EXP-2024-00002',
      title: 'Réparation photocopieuse',
      description: 'Maintenance et réparation de la photocopieuse de la salle des professeurs',
      category: 'maintenance',
      amount: 85000,
      expenseDate: expense2Date,
      supplier: 'TechService SA',
      supplierContact: '0602222222',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date(),
      createdBy: admin._id,
    });

    await Expense.create({
      expenseNumber: 'EXP-2024-00003',
      title: 'Facture électricité - Janvier',
      description: 'Consommation électrique du mois de janvier',
      category: 'utilities',
      amount: 200000,
      expenseDate: new Date(),
      supplier: 'Compagnie d\'Électricité',
      supplierContact: '0603333333',
      status: 'pending',
      createdBy: admin._id,
    });

    await Expense.create({
      expenseNumber: 'EXP-2024-00004',
      title: 'Transport bus scolaire',
      description: 'Location de bus pour la sortie pédagogique',
      category: 'transport',
      amount: 125000,
      expenseDate: event3Date,
      supplier: 'Transport Express',
      supplierContact: '0604444444',
      status: 'pending',
      createdBy: teacher._id,
    });

    // Create messages
    console.log('📬 Création des messages exemple...');
    
    const conversationId1 = uuidv4();
    const conversationId2 = uuidv4();

    // Get first student user
    const firstStudent = students[0];
    const firstStudentUser = await User.findOne({ email: 'student@schoman.com' });
    
    // Message 1: Admin welcomes teacher
    const message1 = await Message.create({
      subject: 'Bienvenue dans Schoman',
      content: 'Bonjour Marie,\n\nBienvenue dans notre système de gestion scolaire Schoman. Vous avez maintenant accès à toutes les fonctionnalités de la plateforme.\n\nN\'hésitez pas à me contacter si vous avez des questions.\n\nCordialement,\nL\'administration',
      sender: admin._id,
      recipients: [teacher._id],
      conversationId: conversationId1,
      priority: 'normal',
      category: 'administrative',
      readBy: [{ user: teacher._id, readAt: new Date() }],
    });

    // Message 2: Teacher replies
    await Message.create({
      subject: 'Re: Bienvenue dans Schoman',
      content: 'Bonjour,\n\nMerci beaucoup pour cet accueil. J\'ai bien exploré la plateforme et tout semble très intuitif.\n\nCordialement,\nMarie',
      sender: teacher._id,
      recipients: [admin._id],
      conversationId: conversationId1,
      parentMessage: message1._id,
      priority: 'normal',
      category: 'administrative',
      readBy: [{ user: admin._id, readAt: new Date() }],
    });

    // Message 3: Teacher to student about homework
    await Message.create({
      subject: 'Devoirs de mathématiques',
      content: 'Bonjour Pierre,\n\nN\'oublie pas de faire les exercices de mathématiques pages 45-46 pour lundi prochain.\n\nBon week-end,\nMme Dupont',
      sender: teacher._id,
      recipients: [firstStudentUser!._id],
      conversationId: conversationId2,
      priority: 'normal',
      category: 'academic',
      readBy: [],
    });

    // Message 4: Admin announcement about event
    const msg4Date = new Date();
    msg4Date.setHours(msg4Date.getHours() - 2);
    
    await Message.create({
      subject: 'IMPORTANT: Sortie pédagogique au musée',
      content: 'Chers enseignants et élèves,\n\nJe vous rappelle que la sortie au musée des sciences est prévue la semaine prochaine. Merci de confirmer votre présence.\n\nL\'autorisation parentale est obligatoire pour tous les élèves.\n\nCordialement,\nL\'administration',
      sender: admin._id,
      recipients: [teacher._id, firstStudentUser!._id],
      priority: 'high',
      category: 'event',
      readBy: [],
      createdAt: msg4Date,
      updatedAt: msg4Date,
    });

    // Message 5: Unread message from admin
    await Message.create({
      subject: 'Réunion pédagogique',
      content: 'Bonjour à tous,\n\nUne réunion pédagogique est prévue vendredi prochain à 14h en salle 201. Présence obligatoire.\n\nOrdre du jour:\n1. Bilan du trimestre\n2. Préparation des examens\n3. Organisation des événements\n\nMerci de confirmer votre présence.\n\nCordialement,\nL\'administration',
      sender: admin._id,
      recipients: [teacher._id],
      priority: 'urgent',
      category: 'administrative',
      readBy: [],
    });

    // Create transactions
    console.log('💵 Création des transactions...');
    const fiscalYear = '2024';
    
    // Income transactions
    await Transaction.create({
      type: 'income',
      amount: 150000,
      category: 'Frais de scolarité',
      description: 'Paiement frais de scolarité - Premier trimestre',
      transactionDate: new Date('2024-09-15'),
      paymentMethod: 'bank_transfer',
      reference: 'PAY-2024-001',
      fiscalYear,
      createdBy: admin._id,
    });

    await Transaction.create({
      type: 'income',
      amount: 50000,
      category: 'Frais de cantine',
      description: 'Paiement frais de cantine - Septembre',
      transactionDate: new Date('2024-09-20'),
      paymentMethod: 'mobile_money',
      reference: 'PAY-2024-002',
      fiscalYear,
      createdBy: admin._id,
    });

    await Transaction.create({
      type: 'income',
      amount: 30000,
      category: 'Activités extra-scolaires',
      description: 'Inscription activités sportives',
      transactionDate: new Date('2024-10-01'),
      paymentMethod: 'cash',
      fiscalYear,
      createdBy: admin._id,
    });

    // Expense transactions
    await Transaction.create({
      type: 'expense',
      amount: 80000,
      category: 'Salaires',
      description: 'Salaires enseignants - Septembre',
      transactionDate: new Date('2024-09-30'),
      paymentMethod: 'bank_transfer',
      reference: 'SAL-2024-09',
      fiscalYear,
      createdBy: admin._id,
    });

    await Transaction.create({
      type: 'expense',
      amount: 25000,
      category: 'Fournitures scolaires',
      description: 'Achat cahiers et stylos',
      transactionDate: new Date('2024-09-10'),
      paymentMethod: 'cash',
      reference: 'FORN-2024-001',
      fiscalYear,
      createdBy: admin._id,
    });

    await Transaction.create({
      type: 'expense',
      amount: 15000,
      category: 'Maintenance',
      description: 'Réparation système électrique',
      transactionDate: new Date('2024-09-25'),
      paymentMethod: 'check',
      reference: 'MAINT-2024-001',
      fiscalYear,
      createdBy: admin._id,
    });

    // Create budget
    console.log('📊 Création du budget...');
    await Budget.create({
      name: 'Budget Annuel 2024-2025',
      fiscalYear: '2024',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-08-31'),
      totalBudget: 2500000,
      incomeItems: [
        {
          category: 'Frais de scolarité',
          allocatedAmount: 1800000,
          spentAmount: 0,
          description: 'Inscription et frais de scolarité annuels',
        },
        {
          category: 'Frais de cantine',
          allocatedAmount: 400000,
          spentAmount: 0,
          description: 'Frais de restauration scolaire',
        },
        {
          category: 'Activités extra-scolaires',
          allocatedAmount: 200000,
          spentAmount: 0,
          description: 'Sports, musique, arts',
        },
        {
          category: 'Autres revenus',
          allocatedAmount: 100000,
          spentAmount: 0,
          description: 'Dons, subventions, etc.',
        },
      ],
      expenseItems: [
        {
          category: 'Salaires',
          allocatedAmount: 1200000,
          spentAmount: 0,
          description: 'Salaires du personnel enseignant et administratif',
        },
        {
          category: 'Fournitures scolaires',
          allocatedAmount: 300000,
          spentAmount: 0,
          description: 'Livres, cahiers, matériel pédagogique',
        },
        {
          category: 'Maintenance',
          allocatedAmount: 200000,
          spentAmount: 0,
          description: 'Entretien des bâtiments et équipements',
        },
        {
          category: 'Électricité et eau',
          allocatedAmount: 150000,
          spentAmount: 0,
          description: 'Factures d\'électricité et d\'eau',
        },
        {
          category: 'Transport',
          allocatedAmount: 100000,
          spentAmount: 0,
          description: 'Transport scolaire et sorties',
        },
        {
          category: 'Autres dépenses',
          allocatedAmount: 50000,
          spentAmount: 0,
          description: 'Dépenses diverses',
        },
      ],
      status: 'active',
      notes: 'Budget prévisionnel pour l\'année scolaire 2024-2025',
      createdBy: admin._id,
    });

    console.log('✅ Données de démonstration créées avec succès!');
    console.log('\n📋 Comptes disponibles:');
    console.log('   Admin: admin@schoman.com / admin123');
    console.log('   Enseignant: teacher@schoman.com / teacher123');
    console.log('   Élève: student@schoman.com / student123');
    console.log('\n📚 Livres créés: 6 livres avec 19 exemplaires au total');
    console.log('📖 Emprunts: 1 emprunt en cours');
    console.log('💰 Factures créées: 3 factures (1 payée, 1 envoyée, 1 brouillon)');
    console.log('📆 Événements créés: 3 événements planifiés');
    console.log('📉 Dépenses créées: 4 dépenses (1 payée, 1 approuvée, 2 en attente)');
    console.log('📬 Messages créés: 5 messages (conversations et notifications)');
    console.log('💵 Transactions créées: 6 transactions (3 revenus, 3 dépenses)');
    console.log('📊 Budgets créés: 1 budget actif pour 2024-2025');
    console.log('\n🎉 Le système est prêt à être utilisé!');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB');
  }
}

seed();
