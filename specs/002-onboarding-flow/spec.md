# Feature Specification: Caltraq Onboarding Flow

**Feature Branch**: `002-onboarding-flow`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "onboarding-flow - Let's create the onboarding flow. Purpose: Gather the minimum required data to perform Katch–McArdle calculations and kickstart goals. We want to create the following screens and their functionality:"

## Constitution Check

This feature has been designed to comply with the Caltraq Constitution:

- **Principle 1 – Typed, Functional, Modular Expo React Native Code**: All onboarding screens and form components will be implemented as typed functional components in TypeScript, with clear separation of concerns and reusable validation utilities.
- **Principle 2 – UI, Styling, and Layout with React Native Reusables**: Onboarding screens will use React Native Reusables components styled via Nativewind, supporting dark mode and respecting safe areas. Form inputs, buttons, and navigation will follow consistent design patterns.
- **Principle 3 – State Management, Data Fetching, and Performance**: Onboarding form state will be managed efficiently, with progress saved incrementally to Convex after each screen (with local caching for offline support) to allow users to resume if they leave mid-flow.
- **Principle 4 – Navigation, Workflow, and Platform Coverage**: Onboarding flow will be implemented with Expo Router, with clear navigation paths and consistent behavior across iOS, Android, and Web. Deep linking to specific onboarding steps will be supported where appropriate.
- **Principle 5 – Reliability, Testing, Error Handling, Security, and i18n**: Critical onboarding flows will have automated tests; input validation will use robust runtime validation; errors will be handled with clear user-facing messages; all user data will be transmitted securely over HTTPS.

No intentional constitution violations are planned for this feature. Any deviation MUST be documented in the implementation plan and pull requests.

## Clarifications

### Session 2025-01-27

- Q: Where should onboarding progress be saved during the flow? → A: Save incrementally to Convex after each screen (with local caching for offline support)
- Q: How should onboarding completion status be tracked? → A: Add an `onboardingCompleted` boolean field to the existing UserAccount entity in Convex. The field is `false` if onboarding is incomplete, and set to `true` when the user finishes onboarding. The actual completion timestamp is stored in `OnboardingProfile.completedAt` for audit trail purposes.
- Q: How should users access the re-onboarding/update flow? → A: A future Settings screen (not part of this feature) will provide an "Update Profile/Goals" option that navigates to onboarding screens with pre-populated values. For this feature, re-onboarding is not required; the focus is on initial onboarding completion.
- Q: What are the exact activity level multiplier values for TDEE calculation? → A: Standard TDEE multipliers: Sedentary (1.2), Lightly Active (1.375), Moderately Active (1.55), Very Active (1.725), Extremely Active (1.9)
- Q: What are the calorie adjustments for each goal phase? → A: Standard percentages: Slow (-10% deficit), Moderate (-20% deficit), Aggressive (-30% deficit), Maintenance (0% change)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Complete onboarding to receive personalized calorie and protein targets (Priority: P1)

A new user who has just created their Caltraq account wants to complete onboarding so they can receive personalized daily calorie and protein targets based on their body composition, activity level, and goals using the Katch–McArdle formula.

**Why this priority**: Without completing onboarding, users cannot receive personalized metabolic calculations or set goals, which are the core value propositions of Caltraq. This is the primary path from account creation to active usage.

**Independent Test**: A tester can create a new account, complete all onboarding screens (units selection, basic stats, activity level, goal setting, review), and confirm that they receive calculated daily calorie and protein targets that are saved to their profile and accessible in the main app.

**Acceptance Scenarios**:

1. **Given** a newly registered user who has just created their account, **When** they navigate through the onboarding flow and provide all required information (units, height, gender, age, weight, body fat or body measurements, activity level, goal), **Then** the system calculates and saves their personalized calorie and protein targets, and the user is taken to the main app with their plan active.
2. **Given** a user who has selected Imperial units, **When** they enter their height and weight, **Then** the system accepts values in pounds and inches, converts and stores them internally in metric (kilograms and centimeters) for calculations, and displays values in Imperial units throughout the UI.
3. **Given** a user who has selected Metric units, **When** they enter their height and weight, **Then** the system accepts and stores values in kilograms and centimeters, and all calculations and displays use Metric units.
4. **Given** a user who knows their body fat percentage, **When** they enter it directly on the Basic Stats screen, **Then** the system uses this value to calculate lean body mass and skips the Body Composition Wizard.
5. **Given** a user who does not know their body fat percentage, **When** they select "Calculate for me" and complete the Body Composition Wizard with neck, waist, and (if female) hip measurements, **Then** the system automatically calculates body fat percentage and lean body mass using the appropriate formula based on gender.
6. **Given** a user who has selected a goal phase (Slow, Moderate, Aggressive, or Maintenance), **When** they set their target weekly weight change or target weight, **Then** the system calculates recommended daily calories and protein targets using the Katch–McArdle formula with their lean body mass and activity level multiplier.
7. **Given** a user who has completed all onboarding steps, **When** they review the final plan summary and confirm, **Then** all their onboarding data is saved to their profile, their calculated targets become active, and they are taken to the main app.

---

### User Story 2 - Navigate onboarding flow with ability to go back and edit previous steps (Priority: P2)

A user who is completing onboarding wants to review or change information they entered on previous screens without having to start over or lose their progress.

**Why this priority**: Users may realize they made an error or want to reconsider a choice. The ability to navigate backward and edit previous steps reduces frustration and abandonment, improving completion rates.

**Independent Test**: A tester can navigate forward through onboarding, use back navigation to return to a previous screen, modify their input, and continue forward again, confirming that their changes are reflected in subsequent screens and final calculations.

**Acceptance Scenarios**:

1. **Given** a user who is on any onboarding screen after the first, **When** they tap a back button or use device back navigation, **Then** they are taken to the previous screen with their previously entered values still populated.
2. **Given** a user who navigates back to the Units Selection screen, **When** they change from Imperial to Metric (or vice versa), **Then** any previously entered measurements are converted to the new unit system, and subsequent screens display values in the new units.
3. **Given** a user who navigates back to the Basic Stats screen after completing the Body Composition Wizard, **When** they choose to enter body fat percentage directly instead, **Then** the system clears the wizard-calculated values and uses the manually entered body fat percentage.
4. **Given** a user who navigates back to change their activity level, **When** they select a different activity level and proceed forward, **Then** the calorie and protein targets on the Review screen are recalculated with the new activity multiplier.

---

### User Story 3 - Resume onboarding after leaving mid-flow (Priority: P3)

A user who starts onboarding but closes the app or navigates away wants to resume from where they left off without losing their progress or having to re-enter information.

**Why this priority**: Users may be interrupted during onboarding. The ability to resume reduces friction and increases completion rates, especially for users who need time to gather information (such as body measurements).

**Independent Test**: A tester can start onboarding, enter information on several screens, close the app, reopen it, and confirm that they are returned to the onboarding flow with all previously entered values preserved, allowing them to continue from where they left off.

**Acceptance Scenarios**:

1. **Given** a user who has started onboarding and entered information on at least one screen, **When** they close the app or navigate away, **Then** their progress is saved incrementally to Convex (with local caching for offline support).
2. **Given** a user who has partially completed onboarding, **When** they return to the app and are authenticated, **Then** they are automatically redirected to the onboarding flow at the last screen they reached, with all previously entered values populated.
3. **Given** a user who has completed onboarding, **When** they return to the app, **Then** they are not shown the onboarding flow again and are taken directly to the main app.

---

### Edge Cases

- What happens when a user enters invalid values (e.g., negative weight, age over 150, body fat percentage over 50%)? **→ Addressed by FR-010: Input validation with clear error messages.**
- How does the system handle users who skip optional fields (e.g., body fat percentage) but then try to proceed without completing the Body Composition Wizard? **→ Addressed by FR-009: Either body fat percentage or body composition measurements must be provided.**
- What happens when a user selects a goal that results in an unrealistic calorie target (e.g., extremely low calories for aggressive weight loss)? **→ Addressed by FR-015: Minimum safe calorie thresholds with warnings.**
- How does the system handle unit conversions when a user changes units mid-flow? **→ Addressed by FR-004: Automatic conversion with precision preservation.**
- What happens if network connectivity is lost during the final confirmation step? **→ Addressed by FR-016: Offline handling with retry mechanism.**
- How does the system handle users who complete onboarding multiple times (e.g., to update their goals)? **→ Addressed by FR-017: Onboarding completion status tracking and re-onboarding flow.**
- What happens when a user enters body measurements that result in an invalid or extreme body fat percentage calculation? **→ Addressed by FR-011: Body fat calculation validation with reasonable bounds.**

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST present a Welcome/Get Started screen to new users who have not completed onboarding, with options to "Create Account" or "Log In" and an optional preview of app benefits (analytics, personalized calories, weekly summaries). This screen serves as the entry point to the onboarding flow.
- **FR-002**: The system MUST integrate the existing Create Account screen (from the authentication flow) into the onboarding flow, allowing users to create an account with email/password and optional SSO (Apple/Google) before proceeding to onboarding steps. After account creation, users proceed directly to the Units Selection screen (step 1 of the onboarding flow).
- **FR-022**: The system MUST display a visual progress indicator (e.g., step counter "Step X of 7" or progress bar) on all onboarding screens after the Welcome screen, showing the user's current position in the flow and total number of steps remaining. The onboarding flow consists of 7 steps total: (0) Welcome, (1) Units Selection, (2) Basic Stats, (3) Body Composition (optional), (4) Activity Level, (5) Goal Setting, (6) Review & Confirm. Step numbering is 0-based internally, but displayed as 1-based to users (e.g., "Step 1 of 7").
- **FR-003**: The system MUST allow users to select their preferred unit system (Imperial: lb, in OR Metric: kg, cm) on a dedicated Units Selection screen, and this selection MUST persist throughout the onboarding flow and the main app. **Note**: All values are stored internally in metric (kg, cm) for calculation consistency; unit preference only affects display and input.
- **FR-004**: The system MUST automatically convert any previously entered measurements when a user changes their unit selection, preserving precision and displaying converted values in the new units.
- **FR-005**: The system MUST collect basic user statistics on an Enter Basic Stats screen: height, gender, age, current weight, and optionally body fat percentage (if known).
- **FR-006**: The system MUST validate that all required fields on the Basic Stats screen are provided and within reasonable bounds (e.g., age 13-120, weight > 0, height > 0) before allowing progression.
- **FR-007**: The system MUST provide an option on the Basic Stats screen to "Calculate for me" that leads to the Body Composition Wizard when body fat percentage is not known.
- **FR-008**: The system MUST present a Body Composition Wizard that collects neck circumference, waist circumference, and (if the user is female) hip circumference measurements.
- **FR-009**: The system MUST require either a manually entered body fat percentage OR completion of the Body Composition Wizard before allowing progression to Activity Level selection.
- **FR-010**: The system MUST validate all body measurements and calculated values (body fat percentage, lean body mass) to ensure they fall within physiologically reasonable ranges, displaying clear error messages for invalid inputs.
- **FR-011**: The system MUST automatically calculate body fat percentage and lean body mass (LBM) from body measurements using gender-appropriate U.S. Navy method formulas when the Body Composition Wizard is completed. For male users: body fat = 495 / (1.0324 - 0.19077 × log₁₀(waist - neck) + 0.15456 × log₁₀(height)) - 450. For female users: body fat = 495 / (1.29579 - 0.35004 × log₁₀(waist + hip - neck) + 0.221 × log₁₀(height)) - 450. For users with gender "other", the system MUST use the male formula as a default. All measurements must be in centimeters. The calculated body fat percentage MUST be clamped to a physiologically reasonable range (0-50%). Lean body mass is then calculated as: LBM = weight × (1 - bodyFatPercentage / 100).
- **FR-012**: The system MUST present an Activity Level selection screen with options corresponding to TDEE multipliers: Sedentary (1.2), Lightly Active (1.375), Moderately Active (1.55), Very Active (1.725), and Extremely Active (1.9).
- **FR-013**: The system MUST allow users to set their goal on a Set Goal screen by choosing a phase (Slow, Moderate, Aggressive, Maintenance) and either a target weekly weight change OR a target weight.
- **FR-014**: The system MUST automatically calculate recommended daily calories and protein targets using the Katch–McArdle formula (BMR = 370 + (21.6 × LBM in kg)) combined with the selected activity level multiplier and goal phase adjustments: Slow (-10% deficit), Moderate (-20% deficit), Aggressive (-30% deficit), Maintenance (0% change).
- **FR-015**: The system MUST enforce minimum safe calorie thresholds (1200 calories for all adult users, regardless of age or gender) and display warnings when calculated targets fall below safe levels, allowing users to adjust their goal if needed. Warnings MUST be displayed as a prominent, non-blocking alert or banner on the Review screen with: (1) clear messaging explaining the safety concern (e.g., "Your calculated daily calories are below the recommended minimum of 1,200 calories"), (2) an explanation of potential health risks, (3) options to adjust the goal phase (e.g., switch from Aggressive to Moderate) or proceed with acknowledgment. The warning MUST not prevent submission but should require explicit user acknowledgment if proceeding with unsafe values.
- **FR-016**: The system MUST present a Review & Confirm Plan screen that displays the calculated daily calorie goal, protein target, expected timeline to reach the goal, and start date before final confirmation.
- **FR-017**: The system MUST track onboarding completion status per user account using an `onboardingCompleted` boolean field on the UserAccount entity, preventing completed users from seeing the onboarding flow again unless they explicitly choose to update their settings via a future "Update Profile/Goals" option (Settings screen is not part of this feature scope). The field is `false` if onboarding is incomplete, and set to `true` when the user finishes onboarding. The actual completion timestamp is stored in `OnboardingProfile.completedAt` for audit trail purposes.
- **FR-018**: The system MUST save all onboarding data (units, stats, body composition, activity level, goals, calculated targets) to the user's profile upon confirmation, making this data available throughout the app.
- **FR-019**: The system MUST allow users to navigate backward through onboarding screens, preserving entered values and recalculating dependent values (such as calorie targets) when previous inputs are modified.
- **FR-020**: The system MUST save onboarding progress incrementally to Convex after each screen (with local caching for offline support) so users can resume from their last screen if they leave mid-flow, even if they switch devices or lose network connectivity temporarily. Cross-device sync is handled automatically by Convex's real-time synchronization when the user signs in on a different device with the same account.
- **FR-021**: The system MUST handle network errors gracefully during the final confirmation step, allowing users to retry saving their onboarding data without losing their entered information.

### Key Entities _(include if feature involves data)_

- **UserAccount** (existing entity, to be extended): The UserAccount entity will include an `onboardingCompleted` boolean field to track whether a user has completed the onboarding flow. This field is `false` if onboarding is incomplete, and set to `true` when the user finishes onboarding. The actual completion timestamp is stored in `OnboardingProfile.completedAt` for audit trail purposes. The field is checked to determine whether to show the onboarding flow or redirect to the main app.
- **OnboardingProfile**: Represents the collection of user data gathered during onboarding. Includes attributes such as unit preference (Imperial/Metric), height, gender, age, current weight, body fat percentage, lean body mass, activity level, goal phase, target weight change or target weight, calculated daily calorie target, calculated protein target, expected timeline, and start date. Linked to the UserAccount entity.
- **BodyCompositionData**: Represents measurements used to calculate body fat percentage. Includes attributes such as neck circumference, waist circumference, hip circumference (if applicable), calculated body fat percentage, and calculated lean body mass. Stored as embedded fields within OnboardingProfile.
- **GoalConfiguration**: Represents the user's selected goal phase and target. Includes attributes such as phase (Slow, Moderate, Aggressive, Maintenance), target type (weekly weight change or target weight), target value, calculated daily calorie target, calculated protein target, expected timeline, and start date. Stored as embedded fields within OnboardingProfile.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 85% of users who start the onboarding flow complete it successfully on their first attempt without abandoning the process (measured as completion rate within 30 days of starting the flow).
- **SC-002**: At least 90% of users can complete the full onboarding flow (from Welcome screen to Review & Confirm) in under 5 minutes of active UI interaction time when they have all required information readily available. This metric measures time spent interacting with the app interface, not including time to gather measurements or other information offline.
- **SC-003**: At least 95% of onboarding data submissions (final confirmation step) complete successfully without errors on the first attempt under normal network conditions.
- **SC-004**: Users who resume onboarding after leaving mid-flow complete the process at a rate of at least 70% (measured as completion rate for users who return within 7 days of starting).
- **SC-005**: At least 90% of calculated calorie and protein targets fall within physiologically reasonable ranges (e.g., daily calories between 1200-5000, protein targets appropriate for the user's weight and goals) as validated by the Katch–McArdle formula and activity level multipliers.
- **SC-006**: After launch, fewer than 5% of users report issues with unit conversions, data loss during navigation, or incorrect calculations during onboarding.
