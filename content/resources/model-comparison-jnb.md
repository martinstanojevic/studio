---
title: Comparing three models on a holdout set
shortDescription: Students fit three competing models and compare their performance on held-out data.
whatStudentsDo: Run pre-written model fits, compute residuals on a holdout set, and decide which model to recommend.
type: JNB
jnbSubtype: Practice
function: Practice
modality: Online
coverage: Section
textbookVersions:
  - ABC v6.0
learningGoals:
  - Compute and interpret holdout residuals
  - Compare models using a common loss metric
  - Recognize when a more complex model is not justified by the data
topicTags:
  - model comparison
  - holdout validation
  - residuals
lengthMinutes: 50
extraMaterialsNeeded: false
studentDataCollectionRequired: false
dataset:
  name: models-comparison
  source: Synthetic — see notes
  variableCount: 5
  variableTypes:
    - numeric
    - categorical
  topicTags:
    - model predictions
    - holdout set
lastUpdated: 2026-03-25
---

## What happens in the classroom

Students work the notebook individually. The three models — a linear, a quadratic, and a piecewise — are pre-fit; the focus is on evaluation, not fitting. After 30 minutes the teacher polls "which model would you recommend?" and runs a structured argument where students must cite a specific residual pattern.

## Learning goals in detail

The deeper lesson is that the model with the lowest training loss is not always the one to deploy. Students should leave able to point at a holdout residual plot and say "this one is overfit because residuals on holdout are much larger than on training, even though the training fit looks great."

## Notes for instructors

The dataset is generated so that the quadratic model is the right answer. About a third of students will pick the piecewise model because it has the lowest training loss — this is the teachable moment. Don't reveal the truth until they've defended their choice in writing.
