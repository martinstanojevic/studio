---
title: Discussion — what does a 95% confidence interval mean?
shortDescription: A discussion-driven notebook unpacking the meaning of confidence intervals and common misconceptions.
whatStudentsDo: Generate confidence intervals from simulated samples and debate three competing interpretations.
type: JNB
jnbSubtype: Discussion
function: Discussion
modality: Online
coverage: Concept
textbookVersions:
  - ABC v5.0
learningGoals:
  - State a correct frequentist interpretation of a confidence interval
  - Identify three common misinterpretations
  - Use simulation to defend the correct interpretation
topicTags:
  - confidence intervals
  - inference
  - frequentist interpretation
lengthMinutes: 35
extraMaterialsNeeded: false
studentDataCollectionRequired: false
dataset:
  name: ci-simulation
  source: Synthetic — generated in-notebook
  variableCount: 3
  variableTypes:
    - numeric
  topicTags:
    - simulation
    - sampling distribution
lastUpdated: 2026-04-19
---

## What happens in the classroom

The notebook runs a 1000-sample simulation and overlays the resulting intervals on the true parameter. Students are then shown three written interpretations of "95% confidence" and asked to vote on which is correct. The teacher stays quiet until the vote is locked in, then opens discussion.

## Learning goals in detail

Students should leave able to articulate that "95%" is a property of the *procedure*, not a property of any particular interval already computed. The simulation is the lever — once they've seen 1000 intervals and counted how many cover the truth, the wording becomes much harder to fudge.

## Notes for instructors

Two of the three written interpretations are subtly wrong but very tempting. Most cohorts split roughly 30-40-30 across the three. Don't move on until at least 80% of the room can correctly identify the wrong ones and explain why. This typically takes longer than instructors expect — budget the full 35 minutes.
