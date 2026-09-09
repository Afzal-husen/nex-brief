# NexBrief — Product Requirements

## Product

**NexBrief** helps turn a client's discovery-call conversation into a clear project brief.

Instead of simply summarizing the conversation, NexBrief helps the user understand:

* What the client said.
* What we understood.
* What is still unclear.
* What questions should be asked.
* What the project could look like.

The user always has the final say.

---

# User Flow

```text
Create Project
      ↓
Add Discovery Call
      ↓
Understand the Client
      ↓
Review What We Know
      ↓
Resolve Important Gaps
      ↓
Create Project Brief
      ↓
Review & Approve
```

---

# User Stories

## 1. Create a Project

**As a user,**
I want to create a project with a client name and project name,
so that I can keep the client's discovery information organized.

---

## 2. Add a Discovery Call

**As a user,**
I want to add a discovery-call transcript to a project,
so that NexBrief can understand the conversation.

---

## 3. Understand the Client

**As a user,**
I want NexBrief to analyze the conversation and explain what it understood,
so that I can quickly understand the client's situation without reading the entire transcript.

NexBrief should identify things such as:

* The client's problem.
* Their current process.
* Their pain points.
* What they want to achieve.
* What they need.
* The tools or systems they use.

---

## 4. See What Is Known

**As a user,**
I want to see which information was clearly stated by the client,
so that I can trust that the information came from the conversation.

Example:

> **Confirmed**
> "We receive around 200 leads every week."

---

## 5. See What Was Inferred

**As a user,**
I want NexBrief to show me when it is making an assumption or inference,
so that I don't mistake an AI interpretation for something the client actually said.

Example:

> **Inferred**
> The client wants to reduce the amount of manual lead qualification.

---

## 6. See What Is Missing

**As a user,**
I want NexBrief to identify important information that wasn't provided,
so that I know what needs to be clarified before moving forward.

Example:

> **Unknown**
> How much time does the client want to save?

---

## 7. Verify Information

**As a user,**
I want to see where an important piece of information came from in the transcript,
so that I can quickly verify whether NexBrief understood the client correctly.

---

## 8. Identify Contradictions

**As a user,**
I want NexBrief to point out when the client gives conflicting information,
so that I can clarify it before making project decisions.

Example:

> The client mentioned Salesforce earlier and HubSpot later.
> Which system should be used?

---

## 9. Get Follow-up Questions

**As a user,**
I want NexBrief to suggest questions for the important missing information,
so that I can have a more productive follow-up conversation with the client.

Example:

> **Question:**
> What does your team currently consider a qualified lead?

The questions should be prioritized so the user knows which ones matter most.

---

## 10. Create a Project Brief

**As a user,**
I want NexBrief to create a clear project brief from the information we have confirmed,
so that I don't have to manually write the brief.

The brief should cover:

* Problem.
* Current process.
* Desired outcome.
* Requirements.
* Proposed solution direction.
* Success criteria.
* Scope.
* Out of scope.
* Risks.
* Open questions.
* Next steps.

---

## 11. Review the Brief

**As a user,**
I want NexBrief to check the project brief for possible mistakes or assumptions,
so that I can review potential problems before using it.

---

## 12. Edit the Brief

**As a user,**
I want to edit the generated brief,
so that I can correct anything NexBrief got wrong or change anything I disagree with.

---

## 13. Approve the Brief

**As a user,**
I want to approve the brief when I am satisfied with it,
so that it becomes the final project brief.

---

## 14. Learn From Corrections

**As a user,**
I want my corrections to be saved,
so that they can be used to test and improve NexBrief in the future.

---

# MVP

The first version should focus only on this experience:

```text
Create Project
      ↓
Add Transcript
      ↓
Understand
      ↓
Review
      ↓
Clarify
      ↓
Generate Brief
      ↓
Review
      ↓
Approve
```

The goal is to make this workflow **simple, useful, and trustworthy** rather than building a large number of features.
