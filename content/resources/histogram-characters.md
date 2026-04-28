---
title: Histogram exploration with the characters dataset
shortDescription: Students build histograms of character heights and reason about shape, center, and spread.
whatStudentsDo: Generate histograms with different bin widths and compare the resulting shapes.
type: JNB
jnbSubtype: Exploration
function: Teaching
modality: Online
coverage: Section
textbookVersions:
  - ABC v5.0
  - ABC v6.0
learningGoals:
  - Identify how bin width changes the apparent shape of a distribution
  - Distinguish unimodal from bimodal distributions
  - Use vocabulary of center and spread accurately
topicTags:
  - histograms
  - distributions
  - data visualization
lengthMinutes: 45
extraMaterialsNeeded: false
studentDataCollectionRequired: false
dataset:
  name: characters
  source: CourseKata starter datasets v2
  variableCount: 6
  variableTypes:
    - numeric
    - categorical
  topicTags:
    - fictional characters
    - heights
lastUpdated: 2026-04-15
---

## What happens in the classroom

The teacher opens with a quick recap of why we visualize distributions before computing statistics. Students then work through the notebook in pairs: first generating a default histogram, then varying the bin width and noticing how the shape changes. The lesson closes with a short discussion comparing student conclusions when bins are too narrow vs. too wide.

## Learning goals in detail

Students should leave able to articulate that bin width is a *choice*, not a property of the data. They should be able to describe the heights distribution using "unimodal", "roughly symmetric", and rough numerical center/spread.

## Notes for instructors

Common misconception: students treat the default histogram as "the answer". Push them to try at least three bin widths before drawing conclusions. Strong evidence of understanding looks like a student spontaneously asking "but what bin width are we using?" when comparing two histograms.
