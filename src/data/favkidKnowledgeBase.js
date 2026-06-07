export const QUICK_QUESTIONS = [
  "New user: How do I use FavKid from start to finish?",
  "Favorite person: What should I do when selected?",
  "What is each tab used for?",
  "How do I create an achievement correctly?",
  "What is Matrix and how does it select a favorite person?",
  "Why is Matrix locked?",
  "Why is no subtask available to assign?",
  "How do predictions work?",
  "Why are other favorite persons asked prediction questions?",
  "How do I upload proof?",
  "How should a favorite person approve or reject proof?",
  "How do points and ranking work?",
  "What is supporter score?",
  "What is weekly recap?",
  "Common testing flow for friends",
];

export const GUIDE_SECTIONS = [
  {
    title: "Start here",
    questions: [
      "New user: How do I use FavKid from start to finish?",
      "What is each tab used for?",
      "Common testing flow for friends",
    ],
  },
  {
    title: "User side",
    questions: [
      "How do I create an achievement correctly?",
      "What is Matrix and how does it select a favorite person?",
      "How do I upload proof?",
    ],
  },
  {
    title: "Favorite person side",
    questions: [
      "Favorite person: What should I do when selected?",
      "How should a favorite person approve or reject proof?",
      "Why are other favorite persons asked prediction questions?",
    ],
  },
  {
    title: "Problems",
    questions: [
      "Why is Matrix locked?",
      "Why is no subtask available to assign?",
      "Why is prediction not showing?",
      "Why is ranking not updated?",
    ],
  },
];

export const FAVKID_KNOWLEDGE_BASE = [
  {
    id: "new_user_full_flow",
    title: "New user: How do I use FavKid from start to finish?",
    keywords: [
      "new user", "start", "how to use", "use app", "begin", "from start", "full flow", "step by step", "first time", "guide", "tutorial", "onboarding",
    ],
    answer: `FavKid is a guided accountability app. The basic user flow is:

1. Create your account and choose your role.
- If you are the person creating goals, use a User account.
- If you are helping someone, use a Favorite Person account.
- If you want both abilities, use a Both account if available.

2. Connect favorite persons.
Go to Connect, share or enter FavKid codes, and accept the connection. Only accepted favorite persons can participate in Matrix, predictions, proof review, and ranking.

3. Create an achievement.
Go to Add. Enter title, description, category, priority, overall deadline, proof type, success criteria, and subtasks. Each subtask needs a clear title and a future deadline.

4. Track your achievement.
Go to Track to view your achievements, progress, subtasks, status, deadlines, and completion percentage.

5. Use Matrix.
Go to Matrix, select one active achievement, then spin/select a Matrix section. FavKid randomly selects one connected favorite person for that achievement.

6. Wait for assignment.
The selected favorite person opens Assign, chooses one valid subtask, answers prediction questions, and assigns the task.

7. Complete the task and upload proof.
After a subtask is assigned, open Matrix and upload proof before the deadline.

8. Favorite person reviews proof.
The selected favorite person views the proof, reacts, writes optional feedback, then approves or rejects.

9. Ranking and recap update.
After approval, points, supporter score, prediction accuracy, streaks, and weekly recap can update.

Best rule: create clear subtasks with future deadlines before using Matrix. Without valid subtasks, Matrix should not continue.`,
    suggestions: [
      "What is each tab used for?",
      "How do I create an achievement correctly?",
      "What is Matrix and how does it select a favorite person?",
      "How do I upload proof?",
    ],
  },
  {
    id: "tab_guide",
    title: "What is each tab used for?",
    keywords: [
      "tabs", "bottom nav", "navigation", "home", "track", "add", "matrix", "assign", "rank", "connect", "guide", "screen", "section", "where to go",
    ],
    answer: `FavKid has these main sections:

Home
- Shows the role-based starting page and quick access to important actions.

Track
- Shows achievements and progress.
- Users can see their own achievements.
- Connected favorite persons may see shared achievements depending on permissions.

Add
- Used by the user to create a new achievement.
- Add achievement details, deadline, success criteria, proof type, and subtasks.
- Favorite-only accounts usually do not need this tab.

Matrix
- Used by the user to select an achievement and randomly select a favorite person.
- Matrix creates the assignment request.
- If the user has an active locked assignment, Matrix waits until approval, expiry, or release.

Assign
- This appears for favorite-person accounts instead of user Matrix flow.
- The selected favorite person assigns a valid subtask.
- Other favorite persons can answer prediction requests.
- The selected favorite person also reviews proof.

Rank
- Shows leaderboard, points, supporter quality score, prediction accuracy, approved tasks, streak, and weekly recap.

Connect
- Used to connect users and favorite persons using FavKid codes.

Guide
- This local chatbot. It explains how the app works and helps testers solve common questions without contacting the creator.`,
    suggestions: [
      "New user: How do I use FavKid from start to finish?",
      "Favorite person: What should I do when selected?",
      "Common testing flow for friends",
    ],
  },
  {
    id: "account_roles",
    title: "What are User, Favorite Person, and Both roles?",
    keywords: [
      "role", "roles", "user", "favorite person", "fav person", "both", "account type", "who am i", "role type", "favorite-only", "user account",
    ],
    answer: `FavKid has role-based behavior.

User
- Creates achievements.
- Adds subtasks.
- Connects favorite persons.
- Uses Matrix to select one favorite person.
- Completes assigned subtasks.
- Uploads proof.
- Views progress, ranking, and recap.

Favorite Person
- Supports a user.
- Gets selected by Matrix.
- Assigns one valid subtask when selected.
- Answers prediction questions.
- Reviews proof only for tasks assigned by them.
- Approves or rejects proof.
- Can answer prediction requests for tasks assigned by other favorite persons.

Both
- Can behave as both User and Favorite Person depending on the screen and connection.

Important rule: only the selected favorite person can assign and approve the task. Other favorite persons can only answer prediction requests for that task.`,
    suggestions: [
      "Favorite person: What should I do when selected?",
      "Why are other favorite persons asked prediction questions?",
      "How should a favorite person approve or reject proof?",
    ],
  },
  {
    id: "connect_people",
    title: "How do I connect favorite persons?",
    keywords: [
      "connect", "connection", "favkid code", "favorite person code", "add favorite", "request", "accepted", "friend", "invite", "share code", "connected user",
    ],
    answer: `To connect favorite persons:

1. Open Connect.
2. Use the FavKid code system to send or accept a connection.
3. The connection must be accepted.
4. After acceptance, that favorite person can appear in the Matrix selection pool.

If a favorite person is not appearing in Matrix:
- Check whether the connection is accepted.
- Check whether the connection type is Favorite Person.
- Refresh the app.
- Confirm both people are logged in with the correct accounts.

Only accepted favorite-person connections can assign tasks, answer predictions, review proof, and appear in ranking.`,
    suggestions: [
      "What is Matrix and how does it select a favorite person?",
      "Why is Matrix locked?",
      "Common testing flow for friends",
    ],
  },
  {
    id: "create_achievement_correctly",
    title: "How do I create an achievement correctly?",
    keywords: [
      "create achievement", "add achievement", "new achievement", "achievement", "goal", "create goal", "title", "description", "success criteria", "proof type", "overall deadline", "deadline", "add tab",
    ],
    answer: `To create an achievement correctly:

1. Open Add.
2. Enter a clear achievement title.
Example: Complete DSA Revision.

3. Add a short description.
Example: Finish important DSA topics before interview practice.

4. Select category and priority.
This helps organize the achievement.

5. Set the overall deadline.
This is the final deadline for the whole achievement.

6. Select proof type.
Example: image, file, text, or link depending on what proof is expected.

7. Write success criteria.
This is important. It tells the favorite person how to verify the work.
Example: Upload screenshots of solved problems with date visible.

8. Add subtasks.
Each subtask should be specific, small, and verifiable.
Example:
- Solve 10 array problems.
- Revise linked list notes.
- Complete graph BFS/DFS practice.

9. Set subtask deadlines.
Each subtask deadline should be before or equal to the overall achievement deadline.

Avoid this mistake:
- Do not create subtasks without future deadlines.
- Do not make all deadlines already expired.
- Do not create vague subtasks like Study more.

A good achievement is easy for the favorite person to assign and easy for the user to prove.`,
    suggestions: [
      "What are subtasks?",
      "Which subtasks are assignable?",
      "How do I upload proof?",
    ],
  },
  {
    id: "subtasks_explained",
    title: "What are subtasks?",
    keywords: [
      "subtask", "subtasks", "task", "tasks", "small steps", "break goal", "deadline", "estimated minutes", "inside achievement", "clear task",
    ],
    answer: `Subtasks are the smaller actions inside one achievement.

Example:
Achievement: Become strong in DSA.
Good subtasks:
1. Solve 10 array problems before Monday.
2. Solve 8 linked list problems before Wednesday.
3. Revise BFS and DFS before Friday.

Why subtasks matter:
- Matrix assigns a subtask, not the whole achievement.
- Favorite persons choose from available subtasks.
- Proof is submitted for the assigned subtask.
- Progress is calculated from completed/approved subtasks.

A good subtask should be:
- Specific.
- Possible to complete before the deadline.
- Easy to verify with proof.
- Not too large.

Bad subtask examples:
- Study.
- Improve life.
- Do coding.

Better examples:
- Solve 5 sliding window problems and upload screenshots.
- Complete React useState notes and upload PDF/image.
- Walk 3 km and upload tracking screenshot.`,
    suggestions: [
      "Which subtasks are assignable?",
      "Why is no subtask available to assign?",
      "How do I create an achievement correctly?",
    ],
  },
  {
    id: "matrix_explained",
    title: "What is Matrix and how does it select a favorite person?",
    keywords: [
      "matrix", "spin", "random", "grid", "section", "dice", "selection", "favorite selected", "select favorite", "cycle", "iteration", "matrix screen", "how matrix works",
    ],
    answer: `Matrix is FavKid's random accountability selection system.

How it works:
1. The user opens Matrix.
2. The user selects an active achievement.
3. The app checks whether the achievement has at least one valid assignable subtask.
4. The user taps/spins a Matrix section.
5. FavKid randomly selects one available favorite person.
6. The selected favorite person receives an assignment request.
7. Matrix becomes locked until the selected task is approved, rejected/resubmitted, expired, or released based on the app logic.

Why Matrix exists:
- It prevents the user from always choosing the same supportive person.
- It makes the process more exciting.
- It distributes responsibility among favorite persons.
- It keeps the user accountable.

Important rules:
- Matrix should not select a favorite person if all subtasks are expired.
- The same favorite person should not repeat in the same achievement iteration until others have been selected.
- Matrix works best when the user has multiple accepted favorite persons.`,
    suggestions: [
      "What is Matrix iteration or cycle?",
      "Why is Matrix locked?",
      "Which subtasks are assignable?",
    ],
  },
  {
    id: "matrix_cycle",
    title: "What is Matrix iteration or cycle?",
    keywords: [
      "cycle", "iteration", "round robin", "repeat favorite", "same favorite", "selected again", "all favorite people", "next iteration", "matrix cycle", "used once",
    ],
    answer: `A Matrix iteration is one round of favorite-person selection for one achievement.

Example:
You have 3 favorite persons: A, B, and C.

Iteration 1:
- Matrix may select B first.
- Next time it should select from A and C.
- After A, B, and C are all selected once, the iteration is complete.

Then the user can start the next iteration.

Why this is useful:
- It avoids selecting the same favorite person again and again.
- It gives all favorite persons a chance to support.
- Ranking and supporter score become fairer.

This applies per achievement. A favorite person selected for Achievement 1 should not automatically block selection in Achievement 2.`,
    suggestions: [
      "What is Matrix and how does it select a favorite person?",
      "Why is Matrix locked?",
      "How do points and ranking work?",
    ],
  },
  {
    id: "assignable_subtasks",
    title: "Which subtasks are assignable?",
    keywords: [
      "assignable", "valid subtask", "valid task", "blocked", "available subtask", "subtask available", "can assign", "cannot assign", "deadline over", "locked", "already assigned",
    ],
    answer: `A subtask is assignable only when all these conditions are true:

1. It belongs to the selected Matrix achievement.
2. It is not already completed or approved.
3. It has a deadline.
4. The deadline is still in the future.
5. It is not already locked by another active Matrix assignment.
6. It is visible to the selected favorite person through the assignment flow.

A subtask should be blocked if:
- Deadline is already over.
- It is already approved/completed.
- It is currently assigned/submitted/rejected in another active flow.
- It does not belong to the current Matrix achievement.

If no subtasks are assignable:
- The selected favorite person cannot assign anything.
- Matrix should release or block the flow.
- The user should create a new subtask with a future deadline or create a new achievement.

Best prevention: before using Matrix, check that the selected achievement has at least one pending subtask with a future deadline.`,
    suggestions: [
      "Why is no subtask available to assign?",
      "What happens if the deadline is over?",
      "How do I create an achievement correctly?",
    ],
  },
  {
    id: "favorite_selected_flow",
    title: "Favorite person: What should I do when selected?",
    keywords: [
      "favorite person selected", "when selected", "selected fav", "assign screen", "what should favorite do", "favorite person guide", "assign task", "selected by matrix", "fav person task",
    ],
    answer: `If you are the selected favorite person, do this:

1. Open Assign.
You will see active Matrix requests where you were selected.

2. Read the user and achievement details.
Confirm which user and which achievement the request belongs to.

3. Choose one valid subtask.
The app should show only subtasks from the current Matrix achievement that are still assignable.

4. Answer prediction questions.
You will answer:
- Do you think the user will complete this task before the deadline?
- What percentage of other favorite persons will say Yes?

5. Assign the task.
After assigning, the user can upload proof.

6. Wait for proof submission.
When the user uploads proof, the assignment becomes submitted.

7. View proof before approval.
Tap View Proof and check the uploaded file.

8. React and add comment.
Choose a reaction such as Great work or Good effort, and optionally write feedback.

9. Approve or reject.
Approve if the proof satisfies the success criteria. Reject if proof is missing, unclear, fake, incomplete, or does not match the task.

Important: only the selected favorite person can assign and approve/reject this task. Other favorite persons can only answer prediction requests.`,
    suggestions: [
      "How should a favorite person approve or reject proof?",
      "How do predictions work?",
      "Why are other favorite persons asked prediction questions?",
    ],
  },
  {
    id: "assignment_flow",
    title: "How does task assignment work?",
    keywords: [
      "assign", "assignment", "assign task", "choose subtask", "favorite assign", "pending assignment", "assigned", "matrix assign", "assignment flow", "task selected",
    ],
    answer: `Task assignment happens after Matrix selects a favorite person.

Flow:
1. User selects achievement in Matrix.
2. User spins/selects Matrix section.
3. Matrix selects one favorite person.
4. A pending assignment is created.
5. The selected favorite person opens Assign.
6. The selected favorite person chooses one valid subtask from that achievement.
7. The selected favorite person answers prediction questions.
8. The task status becomes assigned.
9. The user completes the task and uploads proof.

Assignment should not happen when:
- The achievement has no valid future-deadline subtasks.
- The task is already completed/approved.
- The task is locked by another active assignment.
- The selected favorite person is not connected correctly.

Once assigned, the user should complete it before the subtask deadline.`,
    suggestions: [
      "Which subtasks are assignable?",
      "How do I upload proof?",
      "Why is Matrix locked?",
    ],
  },
  {
    id: "prediction_work",
    title: "How do predictions work?",
    keywords: [
      "prediction", "prediction score", "will user complete", "percentage", "yes percentage", "confidence", "forecast", "bts", "bayesian", "truth serum", "task prediction", "predict",
    ],
    answer: `Predictions make favorite persons more involved before the result is known.

There are two prediction questions:
1. Do you think the user will complete this task before the deadline?
Answer: Yes or No.

2. What percentage of other favorite persons do you think will say Yes?
Answer: a number from 0% to 100%.

Why FavKid asks this:
- It makes favorite persons think carefully before assigning or judging.
- It creates engagement for people who were not selected by Matrix.
- It helps measure who understands the user's ability and consistency.
- It can improve supporter quality score later.

When prediction is asked:
- The selected favorite person answers during assignment.
- Other connected favorite persons answer after the task is assigned, before the final result is known.

After the task result:
- If the user completes and gets approval, predictions can be compared with the actual result.
- Accurate predictions can improve prediction accuracy and supporter quality score.

Prediction does not approve the task. Proof approval is still done only by the selected favorite person.`,
    suggestions: [
      "Why are other favorite persons asked prediction questions?",
      "What is supporter score?",
      "How do points and ranking work?",
    ],
  },
  {
    id: "other_favorites_prediction",
    title: "Why are other favorite persons asked prediction questions?",
    keywords: [
      "other favorite", "other fav people", "other favorite persons", "prediction request", "others answer", "ask everyone", "all favorite persons", "not selected", "prediction requests", "why ask others", "other people predict",
    ],
    answer: `Other favorite persons are asked prediction questions so they can participate even when Matrix did not select them.

Correct logic:
1. Matrix selects one favorite person.
2. That selected favorite person assigns a specific subtask.
3. After the task is assigned, other connected favorite persons can see Prediction Requests.
4. They answer whether they think the user will complete it.
5. They also estimate what percentage of others will say Yes.

What other favorite persons can do:
- Answer prediction requests.
- Improve their prediction accuracy.
- Stay involved in the user's progress.

What they cannot do:
- They cannot assign that task.
- They cannot approve or reject the proof.
- They cannot replace the selected favorite person.

Why not ask before assignment?
Because before assignment, other people do not know the exact subtask. Prediction becomes meaningful only after a specific subtask is selected.`,
    suggestions: [
      "Why is prediction not showing?",
      "How do predictions work?",
      "Favorite person: What should I do when selected?",
    ],
  },
  {
    id: "prediction_not_showing",
    title: "Why is prediction not showing?",
    keywords: [
      "prediction not showing", "no prediction", "prediction request missing", "cannot see prediction", "other favorite not seeing", "question not asked", "prediction question", "not asked",
    ],
    answer: `Prediction may not show for these reasons:

For the selected favorite person:
- Prediction appears during the subtask assignment step.
- If no valid subtask is available, prediction cannot be asked.
- If assignment already happened, the selected person may not see the same prediction form again.

For other favorite persons:
- Prediction Requests appear only after the selected favorite person assigns a specific subtask.
- They must be connected to the user as accepted favorite persons.
- They should not be the selected favorite person for that same task.
- The task result should not already be finalized.
- The task deadline should still be active.
- They should not have already answered the prediction.

If still not showing:
1. Refresh the Assign screen.
2. Confirm the user and favorite person are connected.
3. Confirm the task is assigned, not only pending_assignment.
4. Confirm the deadline is not over.
5. Confirm the favorite person has not already submitted prediction.`,
    suggestions: [
      "Why are other favorite persons asked prediction questions?",
      "How do predictions work?",
      "Why is no subtask available to assign?",
    ],
  },
  {
    id: "proof_upload",
    title: "How do I upload proof?",
    keywords: [
      "proof", "upload proof", "submit proof", "file", "image proof", "document", "screenshot", "task proof", "upload", "proof file", "evidence",
    ],
    answer: `The user uploads proof after a subtask is assigned.

Steps:
1. Open Matrix.
2. Find the active assigned subtask.
3. Tap Submit Proof or Upload Proof.
4. Choose the file/image/document/screenshot.
5. Wait until upload completes.
6. After upload, the task status becomes submitted.
7. The selected favorite person can then review it.

Good proof examples:
- Screenshot of completed work.
- PDF/image/document showing the result.
- Link or text proof if that proof type was selected.
- Fitness tracker screenshot for fitness task.

Bad proof examples:
- Empty image.
- Wrong file.
- Blurry screenshot.
- Proof that does not match the assigned subtask.

Important:
- Upload before the deadline.
- Smaller files are better for testing because free storage can fill quickly.
- The proof must be clear enough for the favorite person to verify.`,
    suggestions: [
      "How should a favorite person approve or reject proof?",
      "Why did proof upload fail?",
      "How do points and ranking work?",
    ],
  },
  {
    id: "proof_upload_failed",
    title: "Why did proof upload fail?",
    keywords: [
      "proof upload failed", "upload failed", "cannot upload proof", "file upload error", "storage error", "proof not uploaded", "submit failed", "large file", "file too large",
    ],
    answer: `Proof upload can fail because of app, file, or Supabase storage conditions.

Common reasons:
1. File is too large.
The app may limit proof size. Use a smaller image or compressed PDF.

2. Internet is weak.
Try again with stable internet.

3. Storage bucket issue.
The task-proofs bucket must exist in Supabase and policies should allow upload.

4. Assignment status is not valid.
Proof upload usually works only after the task is assigned or rejected/resubmission is allowed.

5. Deadline is over.
If the deadline is already passed, the app may block submission or expire the assignment.

6. App cache issue.
Restart the app or run a clean Expo restart during development.

For testers:
- Use small screenshots.
- Upload one proof at a time.
- Wait for the success alert before closing the app.`,
    suggestions: [
      "How do I upload proof?",
      "What happens if the deadline is over?",
      "How should a favorite person approve or reject proof?",
    ],
  },
  {
    id: "proof_review",
    title: "How should a favorite person approve or reject proof?",
    keywords: [
      "review proof", "view proof", "approve proof", "reject proof", "verify", "verification", "proof viewed", "selected favorite review", "reaction", "comment", "feedback", "approve", "reject",
    ],
    answer: `Only the selected favorite person should approve or reject the proof.

Correct review steps:
1. Open Assign.
2. Find the submitted assignment.
3. Tap View Proof.
4. Check whether the proof matches the assigned subtask and success criteria.
5. Select a reaction:
- Great work
- Good effort
- Verified
- Keep going

6. Add a short feedback comment if needed.
Example: Good work, but next time upload a clearer screenshot.

7. Approve if the proof is valid.
Approve means the task is completed, points are awarded, and progress updates.

8. Reject if the proof is not valid.
Reject means the user can upload proof again before the deadline.

Approve when:
- Proof is clear.
- It matches the exact subtask.
- It satisfies success criteria.
- It was submitted before allowed deadline.

Reject when:
- Proof is missing or unclear.
- It does not match the task.
- It is incomplete.
- It looks wrong or unrelated.

Important: the favorite person should view proof before approving.`,
    suggestions: [
      "How do points and ranking work?",
      "What are proof reactions and comments?",
      "Why is ranking not updated?",
    ],
  },
  {
    id: "proof_reactions_comments",
    title: "What are proof reactions and comments?",
    keywords: [
      "reaction", "proof reaction", "comment", "feedback", "great work", "good effort", "verified", "keep going", "short feedback", "approval comment", "rejection comment",
    ],
    answer: `Proof reactions and comments make the verification flow more human.

Reaction options:
- Great work
- Good effort
- Verified
- Keep going

Comments:
The favorite person can add a short note during approval or rejection.

Examples:
- Great work. Continue the next subtask.
- Good effort, but upload a clearer screenshot next time.
- The task is incomplete. Please resubmit with full proof.

Why this matters:
- The user gets useful feedback.
- Favorite persons feel involved.
- Feedback quality can be used for supporter score.
- The app becomes more engaging than a simple approve/reject button.`,
    suggestions: [
      "How should a favorite person approve or reject proof?",
      "What is supporter score?",
      "How do points and ranking work?",
    ],
  },
  {
    id: "points_ranking",
    title: "How do points and ranking work?",
    keywords: [
      "points", "ranking", "leaderboard", "rank", "score", "point rules", "award points", "favorite person points", "approved task", "points awarded",
    ],
    answer: `Points and ranking show how much each favorite person contributed to an achievement.

Basic rule:
- Points are awarded after the selected favorite person views proof and approves the task.

Ranking can consider:
- Points earned.
- Number of tasks assigned.
- Number of tasks approved.
- Prediction accuracy.
- User completion rate.
- Feedback quality.
- Support consistency.
- Supporter streak.

Important:
- Ranking is usually calculated per achievement.
- A new achievement starts a fresh ranking for that achievement.
- Old history can still be stored for analytics.

If ranking does not update:
- Confirm proof was approved, not only submitted.
- Confirm the approval function completed successfully.
- Refresh the Rank screen.
- Confirm the selected achievement is the correct one.
- Check if the leaderboard RPC/database function is updated.`,
    suggestions: [
      "What is supporter score?",
      "What is weekly recap?",
      "Why is ranking not updated?",
    ],
  },
  {
    id: "supporter_score",
    title: "What is supporter score?",
    keywords: [
      "supporter score", "favorite person quality", "quality score", "support quality", "supporter", "streak", "accuracy", "feedback quality", "completion rate",
    ],
    answer: `Supporter score measures the quality of a favorite person's support, not only points.

It can include:
1. Tasks assigned.
How many valid subtasks the favorite person assigned.

2. Tasks approved.
How many submitted proofs they approved after review.

3. Prediction accuracy.
How often their completion predictions matched the actual result.

4. User completion rate.
How often the user completed tasks assigned by that favorite person.

5. Feedback quality.
Whether they gave useful reaction/comment during proof review.

6. Support consistency.
Whether they respond regularly instead of ignoring requests.

7. Supporter streak.
How many successful supported completions they helped with.

Why it is useful:
- A person with high points but poor feedback should not automatically be considered the best supporter.
- Supporter score makes ranking smarter and more fair.
- It encourages favorite persons to give meaningful support.`,
    suggestions: [
      "What is supporter streak?",
      "How do predictions work?",
      "How do points and ranking work?",
    ],
  },
  {
    id: "supporter_streak",
    title: "What is supporter streak?",
    keywords: [
      "supporter streak", "streak", "supported tasks", "helped", "successful completions", "support count", "supported 8 completed tasks", "consistency",
    ],
    answer: `Supporter streak shows how many times a favorite person helped the user complete tasks successfully.

Example:
- Sandy supported 8 completed tasks.
- Priya helped in 5 successful completions.

What can increase streak:
- The favorite person is selected.
- They assign a valid subtask.
- The user submits proof.
- The favorite person verifies and approves.

Why it matters:
- It gives favorite persons a reason to stay active.
- It makes support visible.
- It can be part of favorite person quality score.

Supporter streak is different from points. Points are numerical rewards; streak shows consistent successful support.`,
    suggestions: [
      "What is supporter score?",
      "How do points and ranking work?",
      "What is weekly recap?",
    ],
  },
  {
    id: "weekly_recap",
    title: "What is weekly recap?",
    keywords: [
      "weekly recap", "recap", "weekly", "summary", "week", "top supporter", "most accurate predictor", "tasks completed", "proofs approved", "points earned", "weekly achievement recap",
    ],
    answer: `Weekly recap summarizes the user's progress and supporter activity for the week.

It can show:
- Tasks completed this week.
- Proofs approved this week.
- Points earned this week.
- Top supporter.
- Most accurate predictor.
- Supporter streak.
- Active achievements.

Why it is useful:
- The user sees progress clearly.
- Favorite persons see their contribution.
- It gives everyone a reason to return weekly.
- It turns the app into a progress habit, not just a task app.

For testing:
If weekly recap looks empty, complete at least one full flow:
Matrix selection → assignment → prediction → proof upload → proof view → approval.`,
    suggestions: [
      "How do points and ranking work?",
      "What is supporter score?",
      "Common testing flow for friends",
    ],
  },
  {
    id: "matrix_locked",
    title: "Why is Matrix locked?",
    keywords: [
      "matrix locked", "locked", "cannot spin", "cannot select", "active lock", "stuck", "pending assignment", "assigned task", "submitted", "rejected", "unlock matrix", "lock message",
    ],
    answer: `Matrix can be locked when there is already an active assignment flow.

Common lock states:
1. pending_assignment
A favorite person was selected but has not assigned a subtask yet.

2. assigned
A subtask was assigned and the user must complete/upload proof.

3. submitted
The user uploaded proof and the selected favorite person must review it.

4. rejected
The proof was rejected and the user may need to resubmit before deadline.

Why lock exists:
- It prevents multiple active assignments from confusing the flow.
- It keeps one clear task active until completion, expiry, or release.

How to unlock:
- Selected favorite person assigns the task if it is pending.
- User uploads proof if task is assigned.
- Favorite person approves/rejects if proof is submitted.
- If deadline is over, app should expire/release the assignment.
- If all subtasks are invalid, app should block or release instead of staying stuck.

If it feels stuck:
1. Refresh Matrix.
2. Check Assign screen as the selected favorite person.
3. Check whether the subtask deadline has passed.
4. Check whether there are valid subtasks left.
5. If using test data, create a fresh achievement with future-deadline subtasks.`,
    suggestions: [
      "Why is no subtask available to assign?",
      "What happens if the deadline is over?",
      "Which subtasks are assignable?",
    ],
  },
  {
    id: "no_subtask_available",
    title: "Why is no subtask available to assign?",
    keywords: [
      "no subtask", "no assignable", "no task", "subtask not showing", "task not showing", "cannot assign", "all subtasks", "expired subtasks", "blocked subtasks", "no available subtasks",
    ],
    answer: `No subtask is available when the current achievement has no valid task that can be assigned.

Possible reasons:
1. All subtask deadlines are over.
2. All subtasks are already completed or approved.
3. A subtask is already locked in another active assignment.
4. Subtasks were created without deadlines.
5. The pending assignment is linked to the wrong achievement.
6. RLS/database permissions prevent the favorite person from reading valid tasks.

What to do:
- User should create a new subtask with a future deadline.
- Or create a new achievement with valid subtasks.
- Refresh Matrix and Assign screens.
- Do not spin Matrix for an achievement where all subtasks are expired.

Correct app behavior:
Matrix should check for valid subtasks before selecting a favorite person. If no valid subtasks exist, it should block selection and prevent the flow from getting stuck.`,
    suggestions: [
      "Which subtasks are assignable?",
      "What happens if the deadline is over?",
      "Why is Matrix locked?",
    ],
  },
  {
    id: "deadline_over",
    title: "What happens if the deadline is over?",
    keywords: [
      "deadline", "deadline over", "expired", "time over", "past deadline", "late", "deadline completed", "expire", "overdue", "missed deadline",
    ],
    answer: `When a subtask deadline is over:

- That subtask should not be newly assigned.
- If it is already assigned and not completed, the assignment may expire.
- If all subtasks in an achievement are expired, Matrix should not select a favorite person for that achievement.
- The user should create a new future-deadline subtask or create a fresh achievement.

Why this matters:
If Matrix selects a favorite person for an achievement where all subtasks are expired, the selected favorite person cannot assign anything. That can make the flow stuck.

Correct prevention:
Before Matrix creates a roll, the app should verify that the selected achievement has at least one pending, future-deadline, assignable subtask.`,
    suggestions: [
      "Why is no subtask available to assign?",
      "Why is Matrix locked?",
      "How do I create an achievement correctly?",
    ],
  },
  {
    id: "ranking_not_updated",
    title: "Why is ranking not updated?",
    keywords: [
      "ranking not updated", "leaderboard not updated", "points not updated", "rank not showing", "no points", "score not changed", "weekly recap empty", "supporter score not updated",
    ],
    answer: `Ranking may not update if the full approval flow is not completed.

Check these conditions:
1. Was a subtask assigned?
2. Did the user upload proof?
3. Did the selected favorite person tap View Proof?
4. Did the selected favorite person approve the proof?
5. Did the approval function finish without an error?
6. Are you viewing the correct achievement in Rank?
7. Did you refresh the Ranking screen?

Ranking usually should not update when:
- Task is only assigned.
- Proof is only submitted.
- Proof is rejected.
- Prediction is answered but task is not approved.

Ranking updates best after:
Matrix selection → task assignment → prediction → proof upload → proof view → approval.

If still empty during development, check the leaderboard database function/RPC and table policies.`,
    suggestions: [
      "How do points and ranking work?",
      "What is supporter score?",
      "What is weekly recap?",
    ],
  },
  {
    id: "testing_flow",
    title: "Common testing flow for friends",
    keywords: [
      "testing", "test flow", "friends", "beta", "apk testing", "how to test", "demo", "tester", "testing friends", "sample flow", "qa",
    ],
    answer: `Use this testing flow with friends:

Tester setup:
1. Create one User account.
2. Create two or more Favorite Person accounts.
3. Connect all favorite persons with the user.
4. Accept all connection requests.

User test:
1. User opens Add.
2. User creates one achievement with 3 subtasks.
3. All subtask deadlines should be in the future.
4. User opens Matrix.
5. User selects that achievement.
6. User spins Matrix.

Selected favorite person test:
1. Selected favorite person opens Assign.
2. Assigns one valid subtask.
3. Answers prediction questions.

Other favorite person test:
1. Other connected favorite person opens Assign.
2. Checks Prediction Requests.
3. Answers the prediction.

User proof test:
1. User opens Matrix.
2. Uploads a small proof file.

Review test:
1. Selected favorite person opens Assign.
2. Views proof.
3. Adds reaction/comment.
4. Approves or rejects.

Ranking test:
1. Open Rank.
2. Select the achievement.
3. Check points, quality score, prediction accuracy, and weekly recap.

Best testing advice:
Use small files, future deadlines, and only a few accounts first.`,
    suggestions: [
      "New user: How do I use FavKid from start to finish?",
      "Why is Matrix locked?",
      "Why is prediction not showing?",
    ],
  },
  {
    id: "all_topics",
    title: "Show all guide topics",
    keywords: [
      "all topics", "topics", "help menu", "show help", "questions", "what can i ask", "guide topics", "menu", "faq", "common questions",
    ],
    answer: `You can ask the FavKid Guide Bot about these topics:

Start
- New user: How do I use FavKid from start to finish?
- What is each tab used for?
- Common testing flow for friends.

User side
- How do I create an achievement correctly?
- What are subtasks?
- What is Matrix?
- Why is Matrix locked?
- How do I upload proof?

Favorite person side
- What should I do when selected?
- How does task assignment work?
- How should I approve or reject proof?
- What are proof reactions and comments?

Prediction and scoring
- How do predictions work?
- Why are other favorite persons asked prediction questions?
- What is supporter score?
- What is supporter streak?
- How do points and ranking work?
- What is weekly recap?

Common problems
- Why is no subtask available to assign?
- What happens if the deadline is over?
- Why is prediction not showing?
- Why is ranking not updated?
- Why did proof upload fail?`,
    suggestions: QUICK_QUESTIONS.slice(0, 8),
  },
];

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "our", "should", "the", "this", "to", "we", "what", "when", "where", "who", "why", "will", "with", "you", "your",
]);

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function scoreItem(query, item) {
  const cleanQuery = normalize(query);
  const queryTokens = tokenize(query);
  const title = normalize(item.title);
  const keywords = item.keywords || [];
  const keywordText = normalize(keywords.join(" "));
  const answerText = normalize(item.answer);

  let score = 0;

  if (title && cleanQuery === title) score += 100;
  if (title && cleanQuery.includes(title)) score += 35;

  keywords.forEach((keyword) => {
    const cleanKeyword = normalize(keyword);
    if (!cleanKeyword) return;
    if (cleanQuery === cleanKeyword) score += 40;
    else if (cleanQuery.includes(cleanKeyword)) score += 18;
    else if (cleanKeyword.includes(cleanQuery) && cleanQuery.length > 5) score += 10;

    const keywordTokens = tokenize(cleanKeyword);
    const matched = keywordTokens.filter((word) => queryTokens.includes(word)).length;
    if (matched > 0) score += matched * 4;
  });

  queryTokens.forEach((word) => {
    if (title.includes(word)) score += 7;
    if (keywordText.includes(word)) score += 5;
    if (answerText.includes(word)) score += 1;
  });

  const strongPhraseMatches = [
    ["matrix", "locked"],
    ["no", "subtask"],
    ["prediction", "showing"],
    ["ranking", "updated"],
    ["proof", "upload"],
    ["favorite", "selected"],
    ["weekly", "recap"],
    ["supporter", "score"],
  ];

  strongPhraseMatches.forEach((words) => {
    const allInQuery = words.every((word) => cleanQuery.includes(word));
    const allInItem = words.every((word) => title.includes(word) || keywordText.includes(word));
    if (allInQuery && allInItem) score += 18;
  });

  return score;
}

function buildFallbackAnswer(ranked) {
  const top = ranked.filter((item) => item.score > 0).slice(0, 5);

  if (top.length === 0) {
    return `I do not have an exact local answer for that yet.

Try asking one of these:
- New user: How do I use FavKid from start to finish?
- What is each tab used for?
- Why is Matrix locked?
- Why is no subtask available to assign?
- How do I upload proof?
- How do points and ranking work?

This is a local chatbot, so it answers only from the built-in FavKid guide. The knowledge base can be expanded anytime.`;
  }

  return `I am not fully sure which exact topic you mean, but these are the closest guide topics:

${top.map((item, index) => `${index + 1}. ${item.title}`).join("\n")}

Tap one of the suggested questions below or ask using the exact topic name.`;
}

export function getFavKidBotReply(question) {
  const cleanQuestion = normalize(question);

  if (!cleanQuestion) {
    return {
      title: "Ask me about FavKid",
      answer:
        "Type a question about FavKid, or tap one of the suggested questions. I can explain every major app section, user flow, favorite-person flow, Matrix, predictions, proof review, points, supporter score, weekly recap, and common testing problems.",
      suggestions: QUICK_QUESTIONS.slice(0, 8),
      matched: false,
    };
  }

  if (["help", "menu", "topics", "all topics", "what can i ask"].includes(cleanQuestion)) {
    const menu = FAVKID_KNOWLEDGE_BASE.find((item) => item.id === "all_topics");
    return {
      title: menu.title,
      answer: menu.answer,
      suggestions: menu.suggestions,
      matched: true,
    };
  }

  const ranked = FAVKID_KNOWLEDGE_BASE
    .map((item) => ({ ...item, score: scoreItem(cleanQuestion, item) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score < 5) {
    return {
      title: "I need a clearer question",
      answer: buildFallbackAnswer(ranked),
      suggestions: QUICK_QUESTIONS.slice(0, 8),
      matched: false,
    };
  }

  const related = ranked
    .filter((item) => item.id !== best.id && item.score >= 5)
    .slice(0, 4)
    .map((item) => item.title);

  return {
    title: best.title,
    answer: best.answer,
    suggestions: best.suggestions?.length ? best.suggestions : related.length ? related : QUICK_QUESTIONS.slice(0, 6),
    matched: true,
  };
}
