---
title: Fitting and interpreting simple linear models
shortDescription: Students fit linear models by hand and interpret slope and intercept in context.
whatStudentsDo: Compute slope and intercept from small datasets and sketch the fitted line on graph paper.
type: Worksheet
function: Practice
modality: Paper-based
coverage: Chapter
textbookVersions:
  - ABC v6.0
learningGoals:
  - Compute slope and intercept of a least-squares line by hand for small datasets
  - Interpret slope and intercept in the units of the original variables
  - Identify when a linear model is and is not appropriate
topicTags:
  - linear models
  - regression
  - slope and intercept
lengthMinutes: 30
extraMaterialsNeeded: true
extraMaterialsList:
  - graph paper
  - ruler
  - calculator
studentDataCollectionRequired: false
dataset:
  name: cigarettes
  source: CourseKata starter datasets v2 — public health teaching set
  variableCount: 4
  variableTypes:
    - numeric
    - categorical
  topicTags:
    - public health
    - regression examples
lastUpdated: 2026-02-08
---

## What happens in the classroom

The teacher works one example on the board, then sets students loose on the worksheet. Students fit lines to four small datasets and write a one-sentence interpretation of each slope. The class reconvenes for a discussion of which fits look reasonable and which datasets call for a different model.

## Learning goals in detail

Students practice the mechanical computation enough to be fluent, but the bigger goal is interpretation: a slope of 0.4 nicotine-mg per tar-mg is not just a number, it's a statement about the world. They should also notice when a scatterplot is curved enough that a line is a poor summary.

## Notes for instructors

Common misconception: students report slope without units. Insist on units in every interpretation. The fourth worksheet example is deliberately curvilinear — if no student flags it, ask "would you trust this line if I asked you to predict at x=20?"
