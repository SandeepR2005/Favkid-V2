/* FavKid mock data + shared helpers (plain JS, attached to window) */
(function () {
  const USER = {
    name: "Sandeep",
    first: "Sandeep",
    role: "User",
    email: "sandeep.k@gmail.com",
    code: "FK-8A91BC22",
    momentum: 742,      // credit-score-style index, 300–850
    momentumDelta: 18,  // change this week
    streak: 12,         // day streak
    bestStreak: 21,
  };

  const ACHIEVEMENTS = [
    {
      id: "a1",
      title: "Sample 3",
      desc: "Ship the final portfolio build",
      category: "Skill",
      priority: "High",
      status: "Completed",
      owner: "You",
      progress: 100,
      proof: "Image",
      deadline: "18 Jul 2026, 10:45 pm",
      subtasks: [
        { title: "Sample subtask 3", status: "Approved", date: "05 Jul 2026, 10:45 pm" },
        { title: "Sample subtask 3b", status: "Approved", date: "25 Jun 2026, 10:45 pm" },
      ],
    },
    {
      id: "a2",
      title: "Fggg",
      desc: "Land the design internship",
      category: "Career",
      priority: "Medium",
      status: "Active",
      owner: "You",
      progress: 40,
      proof: "Link",
      deadline: "18 Jul 2026, 10:27 pm",
      subtasks: [
        { title: "Polish case study #1", status: "Approved", date: "02 Jun 2026, 09:00 pm" },
        { title: "Rewrite résumé", status: "Approved", date: "28 May 2026, 06:30 pm" },
        { title: "Apply to 5 studios", status: "Pending", date: "10 Jun 2026, 11:59 pm" },
        { title: "Mock interview", status: "Locked", date: "20 Jun 2026, 07:00 pm" },
        { title: "Portfolio review call", status: "Locked", date: "30 Jun 2026, 05:00 pm" },
      ],
    },
    {
      id: "a3",
      title: "DSA revision",
      desc: "Daily problem streak before placements",
      category: "Study",
      priority: "Medium",
      status: "Completed",
      owner: "You",
      progress: 100,
      proof: "Text",
      deadline: "25 Jun 2026, 5:15 am",
      subtasks: [
        { title: "Arrays + strings", status: "Approved", date: "20 Jun 2026, 09:00 am" },
        { title: "Trees + graphs", status: "Approved", date: "24 Jun 2026, 09:00 am" },
      ],
    },
  ];

  const FAVPEOPLE = [
    { name: "Fav2", email: "lakshmiseetha795@gmail.com", status: "accepted", points: 20, tasks: 1, hue: 256 },
    { name: "Sandy", email: "sandyraina33@gmail.com", status: "accepted", points: 20, tasks: 1, hue: 152 },
  ];

  const MATRIX = {
    achievement: "Fggg",
    achievementSub: "Land the design internship",
    iteration: 5,
    connected: 2,
    remaining: 0,
    cycle: 100,
    grid: [
      { n: 1, kind: "closed" },
      { n: 2, kind: "fav", name: "Sandy", initial: "S", hue: 152 },
      { n: 3, kind: "closed" },
      { n: 4, kind: "closed" },
      { n: 5, kind: "fav", name: "Fav2", initial: "F", hue: 256 },
      { n: 6, kind: "closed" },
      { n: 7, kind: "closed" },
      { n: 8, kind: "closed" },
      { n: 9, kind: "closed" },
    ],
    history: [
      { sec: 2, name: "Sandy", when: "02-Jun-2026, 11:18 am" },
      { sec: 5, name: "Fav2", when: "31-May-2026, 10:50 pm" },
    ],
  };

  // momentum sparkline (last 14 days) + insights
  const INSIGHTS = {
    momentumTrend: [690, 702, 698, 712, 720, 715, 728, 731, 726, 735, 740, 738, 744, 742],
    approvalRate: 92,
    onTime: 78,
    avgPerWeek: 5,
    categories: [
      { name: "Skill", pct: 40, hue: 128 },
      { name: "Career", pct: 30, hue: 256 },
      { name: "Study", pct: 20, hue: 78 },
      { name: "Fitness", pct: 10, hue: 22 },
    ],
    weekTasks: [2, 3, 1, 4, 3, 5, 2], // mon..sun
  };

  const CATEGORIES = ["Study", "Fitness", "Career", "Personal", "Skill"];

  window.FK = { USER, ACHIEVEMENTS, FAVPEOPLE, MATRIX, INSIGHTS, CATEGORIES };
})();
