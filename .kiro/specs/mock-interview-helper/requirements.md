# Requirements Document

## Introduction

The Mock Interview Helper is a web application that helps users practice job interviews across multiple categories. Users are presented with interview questions, answer them using their microphone with live speech-to-text transcription, and receive AI-powered feedback on their responses via the Gemini API. The goal is to help candidates build confidence and improve the quality of their answers before real interviews.

## Glossary

- **Application**: The Mock Interview Helper web application.
- **User**: A person using the Application to practice interview questions.
- **Session**: A single practice run consisting of one or more interview questions within a chosen category.
- **Category**: A classification of interview questions. Valid categories are: Behavioral, Technical, Cultural Fit, Situational, and Communication & Presence.
- **Question**: An interview question presented to the User during a Session.
- **Microphone**: The audio input device used by the User to record spoken answers.
- **Transcription**: The real-time text representation of the User's spoken answer produced by the Speech_To_Text_Engine.
- **Speech_To_Text_Engine**: The browser-native or third-party component that converts microphone audio into text in real time.
- **Answer**: The final transcribed text submitted by the User as their response to a Question.
- **AI_Reviewer**: The Gemini API integration that evaluates Answers and produces Feedback.
- **Feedback**: The structured evaluation of an Answer produced by the AI_Reviewer, including strengths, areas for improvement, and an overall score.
- **Score**: A numeric rating (1–10) assigned by the AI_Reviewer to an Answer.

---

## Requirements

### Requirement 1: Category Selection

**User Story:** As a User, I want to choose an interview category before starting a Session, so that I can practice the type of interview most relevant to my needs.

#### Acceptance Criteria

1. THE Application SHALL present the following five categories on the home screen: Behavioral, Technical, Cultural Fit, Situational, and Communication & Presence.
2. WHEN the User selects a Category, THE Application SHALL display the first Question from that Category within 2 seconds.
3. WHEN the User selects a Category, THE Application SHALL activate the microphone recording interface with live Transcription within 2 seconds.
4. IF the User attempts to start a Session without selecting a Category, THEN THE Application SHALL display an inline error message on the home screen prompting the User to select a Category, without navigating away from the home screen.
5. IF the User denies microphone permission when prompted, THEN THE Application SHALL display a descriptive error message on the home screen and offer a text input fallback so the User can type their Answer.

---

### Requirement 2: Question Presentation

**User Story:** As a User, I want to be shown one interview question at a time, so that I can focus on formulating and delivering a clear answer.

#### Acceptance Criteria

1. WHEN a Session begins, THE Application SHALL display the first Question from the selected Category.
2. WHILE a Question is visible, THE Application SHALL display exactly one Question at a time.
3. WHILE a Question is visible, THE Application SHALL NOT display the Session summary screen.
4. WHEN Feedback for the current Question is displayed, THE Application SHALL offer the User a control to proceed to the next Question and a separate control to end the Session.
5. IF the User chooses to end the Session early, THEN THE Application SHALL immediately navigate to the Session summary screen showing all Questions answered up to that point.
6. IF no more Questions are available in the selected Category after the User proceeds, THEN THE Application SHALL clear the current Question view and display the Session summary screen.

---

### Requirement 3: Microphone-Based Answering

**User Story:** As a User, I want to answer questions using my microphone, so that I can practice speaking naturally as I would in a real interview.

#### Acceptance Criteria

1. THE Application SHALL provide a "Start Recording" control that activates the Microphone and begins capturing the User's spoken answer.
2. WHEN the User activates the Microphone, THE Speech_To_Text_Engine SHALL begin transcribing the User's speech and display the first transcribed text within 2 seconds of speech being detected.
3. WHILE the Microphone is active, THE Application SHALL update the Transcription continuously as the User speaks.
4. WHEN the User activates the "Stop Recording" control, THE Application SHALL deactivate the Microphone and finalize the Transcription as the Answer.
5. IF the browser does not support microphone access, the User denies microphone permission, or a hardware-level microphone failure is detected, THEN THE Application SHALL display a descriptive error message explaining the specific issue and offer a text input fallback so the User can type their Answer.
6. IF the Speech_To_Text_Engine fails to produce a Transcription after the Microphone is activated, THEN THE Application SHALL display an error message and allow the User to retry recording up to 3 times before presenting the text input fallback.
7. IF the Microphone has been active for 10 minutes without the User stopping recording, THEN THE Application SHALL automatically stop recording, finalize the Transcription as the Answer, and notify the User that the maximum recording duration was reached.

---

### Requirement 4: Live Transcription Display

**User Story:** As a User, I want to see my spoken words transcribed in real time as I answer, so that I can monitor my response and correct myself if needed.

#### Acceptance Criteria

1. WHILE the Microphone is active, THE Application SHALL display the in-progress Transcription in a visible text area on the same screen as the Question.
2. WHEN new speech is detected, THE Speech_To_Text_Engine SHALL append the recognized text to the Transcription within 1 second of the speech being spoken.
3. THE Application SHALL visually distinguish between finalized Transcription text (displayed in the default text color) and interim (in-progress) Transcription text (displayed in a muted or italicized style).
4. WHEN the User stops recording, THE Application SHALL display the complete finalized Transcription as the Answer before submission.

---

### Requirement 5: Answer Submission and AI Review

**User Story:** As a User, I want my answer to be evaluated by AI after I finish speaking, so that I can receive objective, actionable feedback on my response.

#### Acceptance Criteria

1. WHEN the User confirms submission of an Answer, THE Application SHALL send the Answer text, the Question text, and the Category to the AI_Reviewer.
2. WHEN the AI_Reviewer receives a submission, THE AI_Reviewer SHALL evaluate the Answer and return Feedback containing: a Score (1–10), a list of 1–5 strengths, a list of 1–5 areas for improvement, and an overall summary of no more than 100 words.
3. WHILE the AI_Reviewer is processing a submission, THE Application SHALL display a loading indicator to the User.
4. WHEN the AI_Reviewer returns Feedback, THE Application SHALL display the Score, strengths, areas for improvement, and summary to the User.
5. IF the AI_Reviewer returns an error or does not respond within 15 seconds, THEN THE Application SHALL display an error message stating the review could not be completed and offer the User the option to resubmit the Answer.
6. WHILE Feedback has been successfully returned, THE Application SHALL NOT display the resubmit option.
7. THE Application SHALL send requests to the AI_Reviewer using the Gemini API and SHALL NOT expose the Gemini API key to the client.
8. IF the User attempts to submit an Answer with no recorded or typed text, THEN THE Application SHALL display an inline validation message and SHALL NOT send a request to the AI_Reviewer.

---

### Requirement 6: Feedback Display

**User Story:** As a User, I want to clearly see the feedback on my answer, so that I understand what I did well and what I should improve.

#### Acceptance Criteria

1. WHEN Feedback is displayed, THE Application SHALL show the Score as the first element in the Feedback view, rendered in a font size at least 1.5× the body text size.
2. WHEN Feedback is displayed, THE Application SHALL show the Question text and the Answer text beneath the Score, in that order.
3. WHEN Feedback is displayed, THE Application SHALL display strengths and areas for improvement as separate, labeled lists beneath the Question and Answer.
4. WHEN Feedback is displayed, THE Application SHALL display the overall summary as a paragraph beneath the strengths and areas for improvement lists.
5. WHEN Feedback is displayed and the AI_Reviewer returns an empty strengths or areas-for-improvement list, THE Application SHALL still render the labeled section with a message such as "None identified" rather than omitting the section.
6. WHEN Feedback is displayed, THE Application SHALL provide a control to proceed to the next Question and a control to end the Session.

---

### Requirement 7: Session Summary

**User Story:** As a User, I want to see a summary of my performance at the end of a Session, so that I can track my overall progress.

#### Acceptance Criteria

1. WHEN a Session ends, THE Application SHALL display a Session summary screen showing each answered Question (those for which Feedback was received), the corresponding Answer, and the Feedback received.
2. WHEN the Session summary is displayed and at least one Question was answered, THE Application SHALL calculate and display the average Score across all answered Questions, rounded to one decimal place.
3. WHEN the Session summary is displayed and no Questions were answered, THE Application SHALL NOT display an average Score and SHALL instead display a message indicating no answers were submitted.
4. WHEN the Session summary is displayed, THE Application SHALL provide a control that navigates the User back to the Category selection screen to start a new Session.

---

### Requirement 8: Accessibility and Responsiveness

**User Story:** As a User, I want the application to be usable on different devices and accessible to assistive technologies, so that I can practice interviews from any device.

#### Acceptance Criteria

1. THE Application SHALL render on all screen widths of 320px and above without any overlapping elements, horizontal scrollbar, or clipped/truncated content.
2. THE Application SHALL meet WCAG 2.1 Level AA contrast requirements for all text and interactive elements.
3. THE Application SHALL provide an accessible name for each interactive control via a visible label, aria-label, or aria-labelledby attribute that describes the control's purpose.
4. WHEN the User navigates the Application using only a keyboard, THE Application SHALL maintain a visible focus indicator on the currently focused element consisting of a minimum 2px outline with at least a 3:1 contrast ratio against adjacent colors.
