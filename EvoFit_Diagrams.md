# EvoFit — Activity & Sequence Diagrams

*AI-Powered Fitness Tracking System — System Behaviour & Interaction Flows*

---

## Activity Diagrams

### 1. User Registration & Onboarding Flow

This activity diagram captures the full lifecycle of a new user registering on EvoFit, from form submission through password validation, duplicate detection, profile creation, and first-time dashboard onboarding.

```mermaid
flowchart TD
    Start([🧑 User visits EvoFit for the first time]) --> OpenAuthPage[Open Authentication Page]
    OpenAuthPage --> ClickRegister[Click Register Tab]
    ClickRegister --> FillForm[Fill in: username, email, password, full name, age, height, weight, gender, fitness goal]
    FillForm --> SubmitForm[Submit Registration Form]

    SubmitForm --> ValidateComplexity{Password meets complexity rules?\nMin 8 chars · Uppercase · Lowercase\nDigit · Special character}

    ValidateComplexity -- ❌ No --> ShowComplexityErr[Show inline password error toast]
    ShowComplexityErr --> FillForm

    ValidateComplexity -- ✅ Yes --> CheckDuplicate{Username or email\nalready exists in DB?}

    CheckDuplicate -- ❌ Yes --> ShowDuplicateErr[Show 'Account already exists' warning]
    ShowDuplicateErr --> FillForm

    CheckDuplicate -- ✅ No --> HashPassword[Hash password using bcrypt via passlib]
    HashPassword --> InsertUser[INSERT User record into DB\n username · email · password_hash · is_admin=false · xp=0 · level=1]
    InsertUser --> InsertProfile[INSERT UserProfile record\n full_name · age · height · weight · gender · fitness_goal]
    InsertProfile --> ReturnUser[Return 201 Created + user object]
    ReturnUser --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> ShowWelcome[Show Welcome Toast\n'Account created successfully!']
    ShowWelcome --> End([✅ User lands on Dashboard ready to track])
```

---

### 2. Workout Upload, ML Classification & XP Award Flow

This diagram traces the end-to-end processing path from a user uploading a raw sensor CSV file, through ML inference, rep counting, form scoring, database persistence, and XP/level-up gamification triggers.

```mermaid
flowchart TD
    Start([🏋️ User navigates to Upload & Analyze page]) --> SelectFile[Select raw IMU sensor CSV file\n Accelerometer x,y,z + Gyroscope x,y,z @ 200ms]
    SelectFile --> ClickPredict[Click Predict & Log Workout]
    ClickPredict --> CheckToken{JWT Token\nValid & Active?}

    CheckToken -- ❌ No --> Err401[Return 401 Unauthorized]
    Err401 --> ShowAuthErr[Prompt user to log in again]
    ShowAuthErr --> End1([Session expired — redirect to login])

    CheckToken -- ✅ Yes --> ParseCSV[Parse raw CSV: validate columns, row count, sensor ranges]
    ParseCSV --> ValidFormat{CSV format\ncorrect?}

    ValidFormat -- ❌ No --> Err400[Return 400 Bad Request\n 'Invalid or empty CSV']
    Err400 --> ShowFormatErr[Show format error to user]
    ShowFormatErr --> SelectFile

    ValidFormat -- ✅ Yes --> ApplyFilter[Apply Butterworth Low-Pass Filter @ 1.3 Hz\n Smooth noisy sensor signal]
    ApplyFilter --> ExtractFeatures[Extract PCA + Fourier Frequency Features]
    ExtractFeatures --> RunRF[Random Forest Classifier Inference\n 98.51% Accuracy across 5 classes]

    RunRF --> ClassifyExercise[Classify Exercise:\n bench / dead / ohp / row / squat]
    ClassifyExercise --> CountReps[Count Repetitions\n Smoothed magnitude peak detection]
    CountReps --> ScoreForm[Score Exercise Form\n Signal deviation from ideal waveform]

    ScoreForm --> SaveSession[Save WorkoutSession to DB\n date · exercise · reps · form_score · duration · mean_power]
    SaveSession --> CalcXP[Calculate XP Earned\n reps × level_multiplier]
    CalcXP --> AddXP[Add XP to User.xp]
    AddXP --> LevelCheck{User XP ≥\nNext Level Threshold?}

    LevelCheck -- ✅ Yes --> LevelUp[Increment User.level]
    LevelUp --> CheckBadges[Scan Achievement Criteria\n Volume milestones · Streak goals · Level targets]
    CheckBadges --> UnlockedBadges{New Badges\nUnlocked?}

    UnlockedBadges -- ✅ Yes --> SaveBadges[INSERT Achievement records to DB]
    SaveBadges --> NotifyLevelBadge[🎉 Trigger Level-Up Toast + Badge Celebration Modal]
    NotifyLevelBadge --> CheckTargets

    UnlockedBadges -- ❌ No --> NotifyLevel[🎉 Trigger Level-Up Toast notification]
    NotifyLevel --> CheckTargets

    LevelCheck -- ❌ No --> CheckTargets[Check Active Weekly Targets\n Did this workout complete a target?]

    CheckTargets -- ✅ Target Complete --> NotifyTarget[🎯 Trigger Target Completion Toast]
    NotifyTarget --> ReturnResult

    CheckTargets -- ❌ No target complete --> ReturnResult[Return 200 OK JSON\n exercise · reps · confidence · form_score · xp_earned · level]

    ReturnResult --> UpdateUI[Update Dashboard UI\n Volume chart · XP bar · Form trend · Heatmap]
    UpdateUI --> End2([✅ Workout successfully classified & logged])
```

---

### 3. Target Management & Progress Tracking Flow

This diagram shows the lifecycle of weekly rep targets — creation, active monitoring during each workout upload, live progress computation, and automated completion notification.

```mermaid
flowchart TD
    Start([📌 User opens Targets page]) --> LoadTargets[GET /targets/ — Load existing active targets]
    LoadTargets --> HasTargets{Active targets\nexist?}

    HasTargets -- ✅ Yes --> ShowTargets[Display target cards with exercise, weekly goal, date range]
    HasTargets -- ❌ No --> ShowEmpty[Show empty state with Create Target prompt]

    ShowEmpty --> ClickCreate
    ShowTargets --> ClickCreate[User clicks + Create New Target]
    ClickCreate --> FillTarget[Select Exercise + Weekly Rep Goal + Date Range]
    FillTarget --> SubmitTarget[POST /targets/]
    SubmitTarget --> ValidateTarget{Date range &\ngoal valid?}

    ValidateTarget -- ❌ No --> ShowTargetErr[Show validation error]
    ShowTargetErr --> FillTarget

    ValidateTarget -- ✅ Yes --> SaveTarget[INSERT Target record to DB\n exercise · weekly_rep_target · start_date · end_date]
    SaveTarget --> ShowNewTarget[Append new target card to list]

    ShowNewTarget --> MonitorLoop{User uploads\nnew workout?}

    MonitorLoop -- ✅ Yes --> UploadWorkout[Workout is classified & saved to DB\n See Activity Diagram 2]
    UploadWorkout --> RecomputeProgress[GET /targets/progress\n Sum reps for each exercise in current week]
    RecomputeProgress --> UpdateProgressBar[Update progress bars with\n completed_reps / weekly_rep_target × 100%]
    UpdateProgressBar --> TargetMet{completed_reps ≥\nweekly_rep_target?}

    TargetMet -- ✅ Yes --> FireToast[🎯 Toast: 'Target Achieved! Well done!']
    FireToast --> MonitorLoop

    TargetMet -- ❌ No --> MonitorLoop

    MonitorLoop -- ❌ No --> DeleteOption{User wants to\ndelete a target?}

    DeleteOption -- ✅ Yes --> ConfirmDelete[Confirm deletion]
    ConfirmDelete --> DeleteTarget[DELETE /targets/{id}]
    DeleteTarget --> RemoveCard[Remove target card from UI]
    RemoveCard --> End

    DeleteOption -- ❌ No --> End([✅ Targets page reflects live progress])
```

---

### 4. Admin User Management Flow

This diagram illustrates the administrative workflow for managing users — viewing account statuses, activating/deactivating accounts, adjusting RAG token limits, and all actions being committed to the audit log.

```mermaid
flowchart TD
    Start([🔐 Admin logs in and navigates to Admin Panel]) --> ValidateAdmin{JWT token\nis_admin = true?}

    ValidateAdmin -- ❌ No --> Err403[Return 403 Forbidden]
    Err403 --> End1([Access denied — redirect to dashboard])

    ValidateAdmin -- ✅ Yes --> LoadStats[GET /admin/stats\n total_users · avg_form · total_predictions · active_users]
    LoadStats --> LoadUsers[GET /admin/users\n Full user list with status, xp, level, token usage]
    LoadUsers --> ShowAdminPanel[Render Admin Dashboard\n Stats cards · User management table · Audit log]

    ShowAdminPanel --> AdminAction{Admin selects\nan action}

    AdminAction --> ToggleStatus[Toggle User Active / Inactive Status]
    ToggleStatus --> PutStatus[PUT /admin/users/{id}/status\n is_active: true / false]
    PutStatus --> LogStatus[INSERT admin_audit_log\n admin_id · action='toggle_status' · details · timestamp]
    LogStatus --> RefreshUsers[Refresh user table row]
    RefreshUsers --> ShowToastAction[Show 'User status updated' toast]
    ShowToastAction --> AdminAction

    AdminAction --> AdjustTokens[Adjust User RAG Token Limit]
    AdjustTokens --> InputLimit[Enter new token cap value]
    InputLimit --> PutToken[PUT /admin/users/{id}/token-limit\n rag_token_limit: N]
    PutToken --> LogToken[INSERT admin_audit_log\n action='set_token_limit' · details]
    LogToken --> RefreshUsers

    AdminAction --> ViewAuditLogs[View Audit Logs]
    ViewAuditLogs --> GetLogs[GET /admin/audit-logs\n Paginated chronological admin actions]
    GetLogs --> ShowLogs[Render log table: admin · action · details · timestamp]
    ShowLogs --> AdminAction

    AdminAction --> CheckHealth[Check System Health]
    CheckHealth --> GetSystemStatus[GET /admin/system-status\n DB connectivity · cache state · error rates]
    GetSystemStatus --> ShowHealth[Render health indicators: DB ✅ · Cache ✅ · Errors ✅]
    ShowHealth --> FlushNeeded{Cache flush\nrequired?}

    FlushNeeded -- ✅ Yes --> FlushCache[POST /admin/system/flush-cache\n Reset global in-memory metrics counters]
    FlushCache --> LogFlush[INSERT admin_audit_log\n action='flush_cache']
    LogFlush --> ShowFlushSuccess[Show 'Cache flushed successfully' toast]
    ShowFlushSuccess --> AdminAction

    FlushNeeded -- ❌ No --> AdminAction

    AdminAction --> End2([✅ Admin tasks complete — audit trail preserved])
```

---

## Sequence Diagrams

### 5. Authentication — Registration & Login Sequence

This sequence diagram covers the full transaction lifecycle for a new user registering and an existing user logging in, including password validation, bcrypt hashing, JWT issuance, and protected route access.

```mermaid
sequenceDiagram
    autonumber
    actor User as 🧑 User
    participant FE as React Frontend
    participant API as FastAPI /users
    participant AuthSvc as Auth Service
    participant DB as SQL Database

    Note over User, DB: ── REGISTRATION FLOW ──

    User->>FE: Fill registration form & submit
    FE->>API: POST /users/register {username, email, password, profile...}
    API->>AuthSvc: validate_password_strength(password)

    alt ❌ Password fails complexity rules
        AuthSvc-->>API: Raise ValidationError (min 8 chars, uppercase, digit, special)
        API-->>FE: 400 Bad Request + detail message
        FE-->>User: Show inline password error toast
    else ✅ Password meets rules
        API->>DB: SELECT user WHERE username=X OR email=Y
        DB-->>API: Result row (or None)

        alt ❌ Username or email already taken
            API-->>FE: 400 Already Registered
            FE-->>User: Show duplicate account warning toast
        else ✅ New user — proceed
            API->>AuthSvc: get_password_hash(plain_password)
            AuthSvc-->>API: bcrypt_hashed_string
            API->>DB: INSERT User (username, email, password_hash, xp=0, level=1, is_admin=false)
            API->>DB: INSERT UserProfile (user_id, full_name, age, height, weight, gender, fitness_goal)
            DB-->>API: 201 Created — user_id returned
            API-->>FE: 201 {id, username, email}
            FE-->>User: ✅ Success toast + Redirect to Dashboard
        end
    end

    Note over User, DB: ── LOGIN FLOW ──

    User->>FE: Enter username + password → click Login
    FE->>API: POST /users/login {username, password}
    API->>DB: SELECT * FROM users WHERE username = X
    DB-->>API: User record (or None)

    alt ❌ User not found
        API-->>FE: 401 Invalid credentials
        FE-->>User: Show auth error notification
    else ✅ User found
        API->>AuthSvc: verify_password(plain, hashed)

        alt ❌ Password mismatch
            AuthSvc-->>API: False
            API-->>FE: 401 Invalid credentials
            FE-->>User: Show auth error notification
        else ❌ Account deactivated
            API-->>FE: 403 Account deactivated — contact admin
            FE-->>User: Show deactivated account banner
        else ✅ Valid credentials
            API->>AuthSvc: create_access_token(user_id, is_admin)
            AuthSvc-->>API: Signed JWT (HS256, exp=60 min)
            API->>DB: UPDATE users SET last_login=now() WHERE id=X
            DB-->>API: Commit OK
            API-->>FE: 200 {access_token, token_type: "bearer"}
            FE-->>User: Store token in memory → Redirect to Dashboard
        end
    end

    Note over FE, DB: ── ACCESSING PROTECTED ROUTES ──

    FE->>API: GET /users/me [Authorization: Bearer <token>]
    API->>AuthSvc: decode_token(token)

    alt ❌ Token expired or invalid signature
        AuthSvc-->>API: JWTError
        API-->>FE: 401 Token expired
        FE-->>User: Prompt to re-login
    else ✅ Token valid
        AuthSvc-->>API: {user_id, is_admin, exp}
        API->>DB: SELECT user + profile WHERE id = user_id
        DB-->>API: Full user record + profile
        API-->>FE: 200 {user, profile, xp, level, rag_token_usage...}
        FE-->>User: Render personalised dashboard header
    end
```

---

### 6. Workout CSV Upload & XP Award Sequence

This sequence diagram details the precise API transaction chain when a user uploads a sensor CSV file — from authentication to ML inference, database writes, XP calculation, and level-up celebration triggers.

```mermaid
sequenceDiagram
    autonumber
    actor User as 🏋️ Athlete
    participant FE as React Frontend
    participant API as FastAPI /predict
    participant ML as ML Inference Service
    participant XPEngine as XP & Progression Engine
    participant DB as SQL Database

    User->>FE: Select CSV file + click Predict & Log
    FE->>API: POST /predict/ [multipart/form-data: file=<csv>] [Bearer token]
    API->>API: Decode JWT → validate user_id

    alt ❌ Token invalid
        API-->>FE: 401 Unauthorized
        FE-->>User: Redirect to login
    else ✅ Authenticated
        API->>ML: parse_and_validate_csv(file_bytes)

        alt ❌ Invalid CSV format
            ML-->>API: ValueError — bad columns or empty rows
            API-->>FE: 400 Bad Request "Invalid CSV format"
            FE-->>User: Show format error toast
        else ✅ CSV valid
            ML->>ML: Apply Butterworth Low-Pass Filter @ 1.3 Hz
            ML->>ML: Extract PCA + Fourier frequency features
            ML->>ML: Random Forest predict(feature_vector)
            ML-->>API: {label: "squat", confidence: 0.98}

            API->>ML: count_repetitions(smoothed_magnitude)
            ML-->>API: rep_count: 5

            API->>ML: compute_form_score(signal_deviations)
            ML-->>API: form_score: 0.87

            API->>DB: INSERT WorkoutSession\n {user_id, date, exercise, reps, form_score, duration, mean_power}
            DB-->>API: session_id returned

            API->>XPEngine: calculate_xp(reps=5, user.level)
            XPEngine-->>API: xp_earned = 50

            API->>DB: UPDATE users SET xp = xp + 50 WHERE id = user_id
            DB-->>API: New total XP

            API->>XPEngine: check_level_up(new_xp, current_level)

            alt ✅ XP crosses level threshold
                XPEngine-->>API: new_level = current_level + 1
                API->>DB: UPDATE users SET level = new_level
                API->>XPEngine: evaluate_achievements(user_id, session)
                XPEngine->>DB: SELECT workout_sessions + achievements WHERE user_id=X
                DB-->>XPEngine: History data
                XPEngine-->>API: [list of newly unlocked badges]
                API->>DB: INSERT Achievements (badge_name, description, icon, unlocked_at)
                DB-->>API: Commit OK
                API-->>FE: 200 {exercise, reps, confidence, form_score, xp_earned, leveled_up: true, new_badges: [...]}
                FE-->>User: 🎉 Level-Up modal + Badge celebration animation
            else ❌ No level-up
                API-->>FE: 200 {exercise, reps, confidence, form_score, xp_earned, leveled_up: false}
                FE-->>User: Smooth XP bar animation + Dashboard charts refresh
            end
        end
    end
```

---

### 7. RAG AI Coach Chat Request Sequence

This sequence diagram shows every layer of the RAG pipeline — from the user's chat query through JWT validation, ChromaDB semantic search, SQL context injection, 48-hour recovery analysis, Groq LLM inference, and token usage persistence.

```mermaid
sequenceDiagram
    autonumber
    actor User as 🧠 Athlete (Chat Panel)
    participant FE as React Frontend
    participant API as FastAPI /chat
    participant CS as Chat Service
    participant RE as 48h Recovery Engine
    participant DB as SQL Database
    participant VDB as ChromaDB Vector Store
    participant Groq as Groq LLaMA 3.1 API

    User->>FE: Type question: "What should I train today?"
    FE->>API: POST /chat/ {query: "..."} [Bearer token]
    API->>API: Decode JWT → extract user_id

    alt ❌ Token invalid / expired
        API-->>FE: 401 Unauthorized
        FE-->>User: Session expired — please re-login
    else ✅ Authenticated
        API->>CS: get_chat_response(query, user_id)

        CS->>DB: SELECT rag_tokens_total, rag_token_limit WHERE user_id=X
        DB-->>CS: {rag_tokens_total: 1200, rag_token_limit: 50000}

        alt ❌ Token usage exceeds limit
            CS-->>API: TokenLimitExceeded error
            API-->>FE: 429 Too Many Requests "RAG token limit reached"
            FE-->>User: Show token limit exceeded warning banner
        else ✅ Within token budget
            CS->>VDB: similarity_search(query, k=3)
            VDB-->>CS: 3 matching exercise guide paragraphs\n (cosine similarity over all-MiniLM-L6-v2 embeddings)

            CS->>DB: SELECT profile (age, weight, height, gender, fitness_goal) WHERE user_id=X
            DB-->>CS: UserProfile record

            CS->>DB: SELECT last 5 WorkoutSessions WHERE user_id=X ORDER BY date DESC
            DB-->>CS: 5 sessions {exercise, reps, form_score}

            CS->>DB: SELECT active Targets WHERE user_id=X AND end_date >= today
            DB-->>CS: Active target list

            CS->>RE: analyze_recovery(user_id)
            RE->>DB: SELECT SUM(reps) GROUP BY exercise WHERE user_id=X AND date >= now-48h
            DB-->>RE: {squat: 45, bench: 20, ohp: 0}

            RE->>RE: Map exercises to muscle groups\n squat→Legs (45 reps > 40 ✅ Recovering)\n bench→Chest & Triceps (20 reps ≤ 40 ✅ Fresh)
            RE-->>CS: {recovering: ["Legs"], fresh: ["Chest & Triceps", "Back & Biceps", "Shoulders"]}

            Note over CS: Compile unified SystemPrompt:\n• RAG rules & persona\n• 3 ChromaDB context chunks\n• User profile & goals\n• Last 5 sessions summary\n• Active targets & progress\n• Recovery analysis output

            CS->>Groq: ChatGroq.invoke(SystemPrompt + user_query)
            Note over Groq: LLaMA 3.1 8B Instant processes contextual prompt\n ~800 tokens/sec throughput

            alt ❌ Groq API error / timeout
                Groq-->>CS: HTTPError or timeout
                CS-->>API: 502 Bad Gateway "AI service temporarily unavailable"
                API-->>FE: Error response
                FE-->>User: Show retry prompt
            else ✅ Groq responds
                Groq-->>CS: {content: "Based on your training...", usage: {prompt_tokens: 800, completion_tokens: 250}}

                CS->>DB: UPDATE users SET rag_tokens_total = rag_tokens_total + 1050 WHERE id=X
                DB-->>CS: Commit OK

                CS-->>API: {response: "coach advice text", tokens_used: 1050}
                API-->>FE: 200 {response, tokens_used}
                FE-->>User: Render coach response with markdown formatting & typing animation
            end
        end
    end
```

---

### 8. Admin Panel — Audit-Safe Action Sequence

This sequence diagram shows how an administrator performs privileged actions (toggling user status and adjusting token limits) with full RBAC enforcement, audit trail persistence, and UI feedback.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 🔐 Administrator
    participant FE as React Admin Panel
    participant API as FastAPI /admin
    participant DB as SQL Database

    Admin->>FE: Navigate to Admin Panel
    FE->>API: GET /admin/stats [Bearer token]
    API->>API: Decode JWT → check is_admin flag

    alt ❌ is_admin = false
        API-->>FE: 403 Forbidden
        FE-->>Admin: Show Access Denied message
    else ✅ is_admin = true
        API->>DB: Aggregate platform stats\n (total users, avg form score, prediction count)
        DB-->>API: Stats payload
        API-->>FE: 200 {total_users, avg_form, total_predictions, active_users}

        FE->>API: GET /admin/users [Bearer token]
        API->>DB: SELECT all users with xp, level, rag_tokens_total, is_active
        DB-->>API: Full user list
        API-->>FE: 200 [{user_id, username, email, level, xp, is_active, rag_usage...}]
        FE-->>Admin: Render user management table

        Note over Admin, DB: ── TOGGLE USER STATUS ──
        Admin->>FE: Click Activate/Deactivate toggle for user_id=42
        FE->>API: PUT /admin/users/42/status {is_active: false} [Bearer token]
        API->>API: Validate is_admin = true
        API->>DB: UPDATE users SET is_active=false WHERE id=42
        DB-->>API: Rows updated: 1
        API->>DB: INSERT admin_audit_log\n {admin_id, action='toggle_user_status', details='user 42 → deactivated', timestamp}
        DB-->>API: Audit log commit OK
        API-->>FE: 200 {user_id: 42, is_active: false}
        FE-->>Admin: Update row badge to "Inactive" + Show success toast

        Note over Admin, DB: ── ADJUST RAG TOKEN LIMIT ──
        Admin->>FE: Set token limit to 100,000 for user_id=37
        FE->>API: PUT /admin/users/37/token-limit {rag_token_limit: 100000} [Bearer token]
        API->>API: Validate is_admin = true
        API->>DB: UPDATE users SET rag_token_limit=100000 WHERE id=37
        DB-->>API: Rows updated: 1
        API->>DB: INSERT admin_audit_log\n {admin_id, action='set_token_limit', details='user 37 → 100000 tokens', timestamp}
        DB-->>API: Audit log commit OK
        API-->>FE: 200 {user_id: 37, rag_token_limit: 100000}
        FE-->>Admin: Update token cap display + Show success toast

        Note over Admin, DB: ── VIEW AUDIT LOGS ──
        Admin->>FE: Click Audit Logs tab
        FE->>API: GET /admin/audit-logs [Bearer token]
        API->>DB: SELECT * FROM admin_audit_logs ORDER BY timestamp DESC LIMIT 100
        DB-->>API: Log entries
        API-->>FE: 200 [{admin_id, action, details, timestamp}...]
        FE-->>Admin: Render chronological audit trail table
    end
```

---

## Diagram Summary

| # | Type | Name | Key Flow Covered |
|---|---|---|---|
| 1 | Activity | User Registration & Onboarding | Password rules → bcrypt → DB insert → Dashboard redirect |
| 2 | Activity | Workout Upload & ML Classification | CSV → Butterworth → RF Predict → XP → Level-up → Badges |
| 3 | Activity | Target Management & Progress | Create target → Monitor workouts → Progress bars → Completion toast |
| 4 | Activity | Admin User Management | RBAC check → Stats → Toggle status → Token limit → Audit log |
| 5 | Sequence | Auth Registration & Login | Form → Validate → Hash → JWT → Protected route access |
| 6 | Sequence | CSV Upload & XP Award | Multipart upload → ML → DB session → XP → Level celebration |
| 7 | Sequence | RAG AI Coach Chat | Query → Token check → ChromaDB → SQL context → Recovery → Groq → Response |
| 8 | Sequence | Admin Panel Actions | RBAC → Stats → Toggle/Token → Audit trail commit |
