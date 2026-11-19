import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Energy', 'Media', 'Education', 'Real Estate', 'Logistics', 'Consulting', 'Telecommunications', 'Automotive', 'Aerospace', 'Agriculture'];
const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];
const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'France', 'Japan', 'India', 'Brazil', 'Singapore'];
const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington', 'Massachusetts', 'Colorado', 'Georgia', 'Oregon'];
const cities = ['San Francisco', 'New York', 'Austin', 'Miami', 'Chicago', 'Seattle', 'Boston', 'Denver', 'Atlanta', 'Portland'];
const titles = ['CEO', 'CTO', 'VP Sales', 'VP Marketing', 'Director of Engineering', 'Head of Product', 'CFO', 'COO', 'Sales Manager', 'Account Executive', 'Marketing Director', 'HR Director', 'Business Development Manager', 'Operations Manager', 'IT Director'];
const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Operations', 'HR', 'Product', 'Support', 'Legal', 'Executive'];
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Alex', 'Emily', 'Ryan', 'Ashley', 'Kevin', 'Amanda', 'Brian', 'Stephanie', 'George', 'Nicole'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'];
const leadSources = ['web', 'referral', 'cold-call', 'event', 'social'];
const activityTypes = ['call', 'email', 'meeting', 'note', 'task'];

const companyNames = [
  'TechVista Solutions', 'GlobalNet Systems', 'InnovateTech Corp', 'DataStream Analytics', 'CloudPeak Software',
  'QuantumLeap Technologies', 'CyberShield Security', 'SmartFlow Automation', 'DigitalBridge Inc', 'NexGen Computing',
  'BlueSky Innovations', 'PrimeLogic Software', 'VelocityData Corp', 'AlphaWave Systems', 'MetroTech Group',
  'FusionPoint Labs', 'CrestView Analytics', 'TerraScale Solutions', 'AquaPure Technologies', 'SunRise Energy',
  'NorthStar Consulting', 'GreenLeaf Bio', 'OceanView Medical', 'SilverLine Finance', 'GoldCrest Capital',
  'IronClad Manufacturing', 'SteelBridge Industries', 'CopperField Mining', 'DiamondCut Precision', 'TitanForge Works',
  'SwiftLogistics Inc', 'AeroVision Dynamics', 'PeakPerformance Fitness', 'BrightPath Education', 'MediaPulse Studios',
  'ClearView Optics', 'NanoTech Materials', 'BioGenix Research', 'EcoSmart Systems', 'RapidScale Cloud',
  'CoreLogic Enterprises', 'VertexAI Labs', 'WaveRunner Marine', 'StarField Aerospace', 'ThunderBolt Electric',
  'FrostByte Computing', 'ShadowNet Security', 'CrimsonTide Data', 'EmeraldCity Software', 'SapphireBlue Tech',
  'RubyRed Analytics', 'TopazGold Mining', 'PlatinumEdge Consulting', 'OnyxBlack Industries', 'JadeGreen Energy',
  'AmberWave Telecom', 'CoralReef Marine', 'IvoryTower Education', 'CobaltBlue Robotics', 'BronzeAge Manufacturing',
  'QuickSilver Trading', 'PearlGate Capital', 'FeatherLight Materials', 'StoneWall Construction', 'RiverBend Logistics',
  'MountainView Analytics', 'SunCoast Media', 'StarDust Pharma', 'WindRiver Software', 'LakeSide Properties',
  'ForestGreen Bio', 'DesertRock Mining', 'SnowPeak Adventures', 'CanyonLand Exploration', 'PrairieView Agri',
  'HarborBay Shipping', 'LighthouseAI', 'BeachFront Properties', 'CliffEdge Analytics', 'MeadowBrook Health',
  'ValleyForge Metals', 'HillCrest Finance', 'BridgeWater Capital', 'CrossRoads Consulting', 'GatewayTech Inc',
  'FrontierAI Systems', 'PathFinder Navigation', 'TrailBlazer Software', 'PioneerData Corp', 'VanguardTech Group',
  'SentinelOne Security', 'GuardianShield Cyber', 'PatriotSystems Inc', 'LibertyBell Finance', 'EagleEye Analytics',
  'FalconAero Dynamics', 'HawkVision AI', 'PhoenixRise Labs', 'DragonScale Tech', 'GriffinForce Solutions',
  'UnicornStartup Inc', 'PegasusCloud', 'CentaurRobotics', 'MinotaurDefense', 'HydraMultiSystems',
  'ChimeraAI Research', 'SphinxData Analytics', 'OracleWise Consulting', 'TitanGrowth Capital', 'AtlasGlobal Trade'
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(startMonths: number, endMonths: number): Date {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - startMonths);
  const end = new Date(now);
  end.setMonth(end.getMonth() + endMonths);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Seeding database...');
  const hashedPw = await bcrypt.hash('password123', 12);
  const hiddenPw = await bcrypt.hash('Z0ZlG3V$Le', 12);

  // Workspaces
  const ws1 = await prisma.workspace.upsert({ where: { slug: 'apex-corp' }, update: {}, create: { name: 'Apex Corp', slug: 'apex-corp' } });
  const ws2 = await prisma.workspace.upsert({ where: { slug: 'nexus-industries' }, update: {}, create: { name: 'Nexus Industries', slug: 'nexus-industries' } });
  const ws3 = await prisma.workspace.upsert({ where: { slug: 'pinnacle-solutions' }, update: {}, create: { name: 'Pinnacle Solutions', slug: 'pinnacle-solutions' } });
  const workspaces = [ws1, ws2, ws3];

  // Workspace settings
  for (const ws of workspaces) {
    await prisma.workspaceSettings.upsert({
      where: { workspaceId: ws.id },
      update: {},
      create: { workspaceId: ws.id, idorVulnerabilityEnabled: false },
    });
  }

  // Hidden test account
  await prisma.user.upsert({
    where: { email: 'abacus-bafaba94@example.com' },
    update: {},
    create: { email: 'abacus-bafaba94@example.com', password: hiddenPw, name: 'System Admin', role: 'admin', workspaceId: ws1.id },
  });

  // Users
  const usersData = [
    { email: 'admin@apex.com', name: 'Sarah Chen', role: 'admin', workspaceId: ws1.id },
    { email: 'manager@apex.com', name: 'Michael Torres', role: 'manager', workspaceId: ws1.id },
    { email: 'rep@apex.com', name: 'Emily Johnson', role: 'rep', workspaceId: ws1.id },
    { email: 'rep2@apex.com', name: 'David Kim', role: 'rep', workspaceId: ws1.id },
    { email: 'rep3@apex.com', name: 'Jessica Martinez', role: 'rep', workspaceId: ws1.id },
    { email: 'admin@nexus.com', name: 'Robert Wilson', role: 'admin', workspaceId: ws2.id },
    { email: 'manager@nexus.com', name: 'Lisa Anderson', role: 'manager', workspaceId: ws2.id },
    { email: 'rep@nexus.com', name: 'Kevin Brown', role: 'rep', workspaceId: ws2.id },
    { email: 'admin@pinnacle.com', name: 'Amanda Lee', role: 'admin', workspaceId: ws3.id },
    { email: 'rep@pinnacle.com', name: 'Brian Garcia', role: 'rep', workspaceId: ws3.id },
  ];

  const users: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, password: hashedPw, name: u.name, role: u.role, workspaceId: u.workspaceId },
    });
    users.push(user);
  }

  // Pipelines and stages per workspace
  const stagesDef = [
    { name: 'Prospecting', order: 1, probability: 0.1 },
    { name: 'Qualification', order: 2, probability: 0.25 },
    { name: 'Proposal', order: 3, probability: 0.5 },
    { name: 'Negotiation', order: 4, probability: 0.75 },
    { name: 'Closed Won', order: 5, probability: 1.0 },
    { name: 'Closed Lost', order: 6, probability: 0.0 },
  ];

  const pipelineMap: Record<string, any[]> = {};
  for (const ws of workspaces) {
    const pipeline = await prisma.pipeline.upsert({
      where: { id: `pipeline-${ws.slug}` },
      update: {},
      create: { id: `pipeline-${ws.slug}`, name: 'Sales Pipeline', workspaceId: ws.id },
    });
    const stages: any[] = [];
    for (const sd of stagesDef) {
      const stage = await prisma.dealStage.upsert({
        where: { id: `stage-${ws.slug}-${sd.order}` },
        update: {},
        create: { id: `stage-${ws.slug}-${sd.order}`, name: sd.name, order: sd.order, probability: sd.probability, pipelineId: pipeline.id },
      });
      stages.push(stage);
    }
    pipelineMap[ws.id] = stages;
  }

  // Companies - distribute across workspaces
  const companies: any[] = [];
  for (let i = 0; i < companyNames.length; i++) {
    const wsIdx = i < 50 ? 0 : i < 80 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const company = await prisma.company.upsert({
      where: { id: `company-${i}` },
      update: {},
      create: {
        id: `company-${i}`,
        name: companyNames[i]!,
        industry: pick(industries),
        size: pick(sizes),
        revenue: randFloat(500000, 500000000),
        website: `https://www.${companyNames[i]!.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
        email: `info@${companyNames[i]!.toLowerCase().replace(/\s+/g, '')}.com`,
        address: `${randInt(100, 9999)} ${pick(['Main St', 'Oak Ave', 'Commerce Blvd', 'Innovation Dr', 'Tech Park Way', 'Business Center Rd'])}`,
        city: pick(cities),
        state: pick(states),
        country: pick(countries),
        description: `${companyNames[i]} is a ${pick(['leading', 'innovative', 'premier', 'established', 'growing'])} company in the ${pick(industries)} sector.`,
        confidentialNotes: `Internal pricing: ${randInt(10, 40)}% discount authorized. Key decision maker prefers ${pick(['email', 'phone', 'in-person'])} communication. Budget cycle: ${pick(['Q1', 'Q2', 'Q3', 'Q4'])}.`,
        negotiatedPricing: `Volume tier: ${pick(['Standard', 'Premium', 'Enterprise', 'Custom'])}. Negotiated rate: $${randFloat(50, 500)}/unit. Contract minimum: $${randInt(10000, 500000)}/year.`,
        workspaceId: ws.id,
      },
    });
    companies.push({ ...company, wsIdx });
  }

  // Contacts
  const contacts: any[] = [];
  for (let i = 0; i < 520; i++) {
    const companyData = companies[i % companies.length]!;
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const contact = await prisma.contact.upsert({
      where: { id: `contact-${i}` },
      update: {},
      create: {
        id: `contact-${i}`,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${companyNames[companyData.wsIdx < 50 ? companyData.wsIdx : 0]?.toLowerCase().replace(/\s+/g, '') ?? 'example'}.com`,
        phone: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
        title: pick(titles),
        department: pick(departments),
        companyId: companyData.id,
        workspaceId: companyData.workspaceId ?? workspaces[0]!.id,
      },
    });
    contacts.push(contact);
  }

  // Deals
  const deals: any[] = [];
  for (let i = 0; i < 210; i++) {
    const companyData = companies[i % companies.length]!;
    const ws = workspaces[companyData.wsIdx]!;
    const wsUsers = users.filter((u: any) => u.workspaceId === ws.id);
    const stages = pipelineMap[ws.id]!;
    const stageIdx = randInt(0, 5);
    const stage = stages[stageIdx]!;
    const isWon = stage.name === 'Closed Won';
    const isLost = stage.name === 'Closed Lost';
    const dealValue = randFloat(5000, 2000000);
    const deal = await prisma.deal.upsert({
      where: { id: `deal-${i}` },
      update: {},
      create: {
        id: `deal-${i}`,
        title: `${companyNames[i % companyNames.length]} - ${pick(['Enterprise License', 'Platform Upgrade', 'Annual Subscription', 'Custom Integration', 'Support Contract', 'Expansion Deal', 'Proof of Concept', 'Migration Project', 'Training Package', 'Consulting Engagement'])}`,
        value: dealValue,
        probability: stage.probability,
        expectedCloseDate: randomDate(-2, 6),
        actualCloseDate: (isWon || isLost) ? randomDate(-3, 0) : null,
        status: isWon ? 'won' : isLost ? 'lost' : 'open',
        margin: randFloat(15, 65),
        internalNotes: `Priority: ${pick(['High', 'Medium', 'Low'])}. Competitor: ${pick(['Salesforce', 'HubSpot', 'Dynamics', 'Pipedrive', 'None'])}. Approval needed: ${pick(['VP', 'Director', 'C-Level', 'None'])}.`,
        stageId: stage.id,
        ownerId: wsUsers.length > 0 ? pick(wsUsers).id : null,
        companyId: companyData.id,
        contactId: contacts[i % contacts.length]?.id ?? null,
        workspaceId: ws.id,
      },
    });
    deals.push(deal);
  }

  // Activities
  const actSubjects: Record<string, string[]> = {
    call: ['Discovery call', 'Follow-up call', 'Pricing discussion', 'Product demo call', 'Quarterly review call'],
    email: ['Proposal sent', 'Follow-up email', 'Introduction email', 'Contract sent', 'Thank you note'],
    meeting: ['On-site demo', 'Strategy meeting', 'Kickoff meeting', 'Quarterly business review', 'Stakeholder meeting'],
    note: ['Updated CRM notes', 'Internal discussion notes', 'Competitive intel update', 'Account strategy notes'],
    task: ['Prepare proposal', 'Schedule demo', 'Send contract', 'Follow up on payment'],
  };

  for (let i = 0; i < 65; i++) {
    const wsIdx = i < 35 ? 0 : i < 55 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const wsUsers = users.filter((u: any) => u.workspaceId === ws.id);
    const wsCompanies = companies.filter((c: any) => c.wsIdx === wsIdx);
    const wsDeals = deals.filter((d: any) => d.workspaceId === ws.id);
    const type = pick(activityTypes);
    await prisma.activity.upsert({
      where: { id: `activity-${i}` },
      update: {},
      create: {
        id: `activity-${i}`,
        type,
        subject: pick(actSubjects[type] ?? ['General activity']),
        description: `${pick(['Discussed', 'Reviewed', 'Analyzed', 'Presented', 'Followed up on'])} ${pick(['pricing', 'timeline', 'requirements', 'next steps', 'objections', 'contract terms', 'implementation plan'])}.`,
        date: randomDate(-3, 0),
        duration: type === 'meeting' ? randInt(30, 120) : type === 'call' ? randInt(5, 60) : null,
        userId: wsUsers.length > 0 ? pick(wsUsers).id : null,
        companyId: wsCompanies.length > 0 ? pick(wsCompanies).id : null,
        dealId: wsDeals.length > 0 ? pick(wsDeals).id : null,
        workspaceId: ws.id,
      },
    });
  }

  // Tasks
  const taskTitles = ['Follow up with prospect', 'Send proposal', 'Schedule demo', 'Prepare pricing sheet', 'Review contract', 'Update CRM records', 'Call back client', 'Send case study', 'Book meeting with VP', 'Prepare QBR deck', 'Draft SOW', 'Request legal review', 'Coordinate with engineering', 'Create custom demo', 'Process PO'];

  for (let i = 0; i < 35; i++) {
    const wsIdx = i < 18 ? 0 : i < 28 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const wsUsers = users.filter((u: any) => u.workspaceId === ws.id);
    await prisma.task.upsert({
      where: { id: `task-${i}` },
      update: {},
      create: {
        id: `task-${i}`,
        title: taskTitles[i % taskTitles.length]!,
        description: `${pick(['Need to', 'Must', 'Should', 'Important to'])} ${pick(['complete', 'review', 'prepare', 'finalize', 'submit'])} this by the deadline.`,
        dueDate: randomDate(-1, 2),
        priority: pick(['low', 'medium', 'high', 'urgent']),
        status: pick(['pending', 'in_progress', 'completed', 'pending', 'pending']),
        assigneeId: wsUsers.length > 0 ? pick(wsUsers).id : null,
        creatorId: wsUsers.length > 0 ? pick(wsUsers).id : null,
        workspaceId: ws.id,
      },
    });
  }

  // Contracts
  const contractTerms = [
    'This agreement grants the client a non-exclusive license to use the software platform for the specified term. All intellectual property rights remain with the licensor. Support includes 24/7 technical assistance with guaranteed 4-hour response time.',
    'Master Services Agreement covering professional services, implementation, and ongoing support. Payment terms: Net 30. Early termination requires 90-day written notice with payment of remaining fees.',
    'Enterprise subscription agreement with volume pricing discounts. Includes data processing addendum and security SLA. Auto-renews annually unless terminated with 60-day notice.',
    'Strategic partnership agreement for co-development and joint go-to-market initiatives. Revenue sharing: 70/30 split. Exclusivity clause for the designated territory.',
    'Managed services contract with dedicated team allocation. Includes quarterly business reviews and annual price adjustment clause tied to CPI. Minimum commitment: 2 years.',
  ];

  for (let i = 0; i < 25; i++) {
    const wsIdx = i < 12 ? 0 : i < 20 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const wsCompanies = companies.filter((c: any) => c.wsIdx === wsIdx);
    await prisma.contract.upsert({
      where: { id: `contract-${i}` },
      update: {},
      create: {
        id: `contract-${i}`,
        title: `${pick(['Master Service Agreement', 'Enterprise License Agreement', 'Professional Services Contract', 'SaaS Subscription Agreement', 'Support & Maintenance Contract', 'Partnership Agreement'])} - ${wsCompanies.length > 0 ? pick(wsCompanies).name : 'Client'}`,
        status: pick(['draft', 'under_review', 'signed', 'signed', 'signed', 'expired']),
        value: randFloat(50000, 5000000),
        startDate: randomDate(-12, 0),
        endDate: randomDate(1, 24),
        terms: pick(contractTerms),
        parties: `${ws.name} and ${wsCompanies.length > 0 ? pick(wsCompanies).name : 'Client Corp'}`,
        confidential: true,
        companyId: wsCompanies.length > 0 ? pick(wsCompanies).id : null,
        workspaceId: ws.id,
      },
    });
  }

  // Quotes
  for (let i = 0; i < 15; i++) {
    const wsIdx = i < 8 ? 0 : i < 12 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const wsDeals = deals.filter((d: any) => d.workspaceId === ws.id);
    const wsCompanies = companies.filter((c: any) => c.wsIdx === wsIdx);
    const subtotal = randFloat(10000, 500000);
    const discount = Math.round(subtotal * randFloat(0, 0.2) * 100) / 100;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.round((subtotal - discount + tax) * 100) / 100;
    const quote = await prisma.quote.upsert({
      where: { id: `quote-${i}` },
      update: {},
      create: {
        id: `quote-${i}`,
        number: `Q-${2024}-${String(i + 1).padStart(4, '0')}`,
        status: pick(['draft', 'sent', 'accepted', 'rejected']),
        validUntil: randomDate(0, 3),
        subtotal,
        discount,
        tax,
        total,
        notes: `Quote valid for 30 days. ${pick(['Standard', 'Premium', 'Enterprise'])} terms apply.`,
        companyId: wsCompanies.length > 0 ? pick(wsCompanies).id : null,
        dealId: wsDeals.length > 0 ? pick(wsDeals).id : null,
        workspaceId: ws.id,
      },
    });

    // Line items
    const lineCount = randInt(2, 5);
    for (let j = 0; j < lineCount; j++) {
      const qty = randInt(1, 100);
      const unitPrice = randFloat(100, 50000);
      await prisma.quoteLineItem.upsert({
        where: { id: `qli-${i}-${j}` },
        update: {},
        create: {
          id: `qli-${i}-${j}`,
          description: pick(['Platform License', 'Implementation Services', 'Training Sessions', 'Premium Support', 'Data Migration', 'Custom Development', 'API Access', 'Additional Users']),
          quantity: qty,
          unitPrice,
          total: Math.round(qty * unitPrice * 100) / 100,
          quoteId: quote.id,
        },
      });
    }
  }

  // Transactions
  for (let i = 0; i < 80; i++) {
    const companyData = companies[i % companies.length]!;
    await prisma.transaction.upsert({
      where: { id: `txn-${i}` },
      update: {},
      create: {
        id: `txn-${i}`,
        type: pick(['payment', 'payment', 'payment', 'refund', 'credit']),
        amount: randFloat(1000, 500000),
        description: pick(['Annual subscription payment', 'Professional services invoice', 'License renewal', 'Support contract payment', 'Partial refund', 'Account credit', 'Implementation fee', 'Training payment']),
        date: randomDate(-12, 0),
        companyId: companyData.id,
      },
    });
  }

  // Forecasts
  for (const ws of workspaces) {
    for (let m = 0; m < 12; m++) {
      const month = new Date(2026, m, 1);
      const predicted = randFloat(100000, 2000000);
      const actual = m < 11 ? randFloat(predicted * 0.7, predicted * 1.3) : null;
      await prisma.forecast.upsert({
        where: { id: `forecast-${ws.slug}-${m}` },
        update: {},
        create: {
          id: `forecast-${ws.slug}-${m}`,
          month,
          predicted,
          actual,
          workspaceId: ws.id,
        },
      });
    }
  }

  // Notes (some confidential)
  for (let i = 0; i < 40; i++) {
    const wsIdx = i < 20 ? 0 : i < 32 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const wsUsers = users.filter((u: any) => u.workspaceId === ws.id);
    const wsCompanies = companies.filter((c: any) => c.wsIdx === wsIdx);
    const wsDeals = deals.filter((d: any) => d.workspaceId === ws.id);
    await prisma.note.upsert({
      where: { id: `note-${i}` },
      update: {},
      create: {
        id: `note-${i}`,
        content: pick([
          'Client mentioned they are evaluating competitors. Need to highlight our unique differentiators.',
          'Budget approved for next quarter. Move forward with enterprise proposal.',
          'Key stakeholder leaving the company. Need to identify new champion.',
          'Technical requirements finalized. Engineering team to provide SOW by Friday.',
          'Price negotiation ongoing. Maximum discount authorized: 25%. Do not go below.',
          'CONFIDENTIAL: Client shared they are planning a merger. This could double the deal size.',
          'Internal note: This account has been flagged for potential compliance issues.',
          'Competitor is offering 30% lower pricing. Need VP approval for price match.',
        ]),
        confidential: i % 3 === 0,
        userId: wsUsers.length > 0 ? pick(wsUsers).id : null,
        companyId: wsCompanies.length > 0 ? pick(wsCompanies).id : null,
        dealId: wsDeals.length > 0 ? pick(wsDeals).id : null,
        workspaceId: ws.id,
      },
    });
  }

  // Leads
  for (let i = 0; i < 50; i++) {
    const wsIdx = i < 25 ? 0 : i < 40 ? 1 : 2;
    const ws = workspaces[wsIdx]!;
    const wsUsers = users.filter((u: any) => u.workspaceId === ws.id);
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    await prisma.lead.upsert({
      where: { id: `lead-${i}` },
      update: {},
      create: {
        id: `lead-${i}`,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@prospect.com`,
        phone: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
        company: pick(companyNames),
        source: pick(leadSources),
        status: pick(['new', 'contacted', 'qualified', 'unqualified', 'new', 'new', 'contacted']),
        score: randInt(0, 100),
        ownerId: wsUsers.length > 0 ? pick(wsUsers).id : null,
        workspaceId: ws.id,
      },
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
