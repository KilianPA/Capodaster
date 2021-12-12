const searchSize = this.frequencyBufferLength * 0.5
let offsetKey = null
let offset = 0
let difference = 0
const tolerance = 0.001
let rms = 0
const rmsMin = 0.008
const assessedStringsInLastFrame = this.assessedStringsInLastFrame

// Fill up the data.
this.analyser.getFloatTimeDomainData(this.frequencyBuffer)

// Figure out the root-mean-square, or rms, of the audio. Basically
// this seems to be the amount of signal in the buffer.
for (let d = 0; d < this.frequencyBuffer.length; d++) {
  rms += this.frequencyBuffer[d] * this.frequencyBuffer[d]
}

rms = Math.sqrt(rms / this.frequencyBuffer.length)

// If there's little signal in the buffer quit out.
if (rms < rmsMin) { return 0 }

// Only check for a new string if the volume goes up. Otherwise assume
// that the string is the same as the last frame.
if (rms > this.lastRms + this.rmsThreshold) { this.assessStringsUntilTime = time + 250 }

if (time < this.assessStringsUntilTime) {
  this.assessedStringsInLastFrame = true

  // Go through each string and figure out which is the most
  // likely candidate for the string being tuned based on the
  // difference to the "perfect" tuning.
  for (let o = 0; o < this.stringsKeys.length; o++) {
    offsetKey = this.stringsKeys[o]
    offset = this.strings[offsetKey].offset
    difference = 0

    // Reset how often this string came out as the closest.
    if (assessedStringsInLastFrame === false) { this.strings[offsetKey].difference = 0 }

    // Now we know where the peak is, we can start
    // assessing this sample based on that. We will
    // step through for this string comparing it to a
    // "perfect wave" for this string.
    for (let i = 0; i < searchSize; i++) {
      difference += Math.abs(this.frequencyBuffer[i] -
        this.frequencyBuffer[i + offset])
    }

    difference /= searchSize

    // Weight the difference by frequency. So lower strings get
    // less preferential treatment (higher offset values). This
    // is because harmonics can mess things up nicely, so we
    // course correct a little bit here.
    this.strings[offsetKey].difference += (difference * offset)
  }
} else {
  this.assessedStringsInLastFrame = false
}

// If this is the first frame where we've not had to reassess strings
// then we will order by the string with the largest number of matches.
if (assessedStringsInLastFrame === true &&
  this.assessedStringsInLastFrame === false) {
  this.stringsKeys.sort(this.sortStringKeysByDifference)
}

// Next for the top candidate in the set, figure out what
// the actual offset is from the intended target.
// We'll do it by making a full sweep from offset - 10 -> offset + 10
// and seeing exactly how long it takes for this wave to repeat itself.
// And that will be our *actual* frequency.
const searchRange = 10
const assumedString = this.strings[this.stringsKeys[0]]
const searchStart = assumedString.offset - searchRange
const searchEnd = assumedString.offset + searchRange
let actualFrequency = assumedString.offset
let smallestDifference = Number.POSITIVE_INFINITY

for (let s = searchStart; s < searchEnd; s++) {
  difference = 0

  // For each iteration calculate the difference of every element of the
  // array. The data in the buffer should be PCM, so values ranging
  // from -1 to 1. If they match perfectly then they'd essentially
  // cancel out. But this is real data so we'll be looking for small
  // amounts. If it's below tolerance assume a perfect match, otherwise
  // go with the smallest.
  //
  // A better version of this would be to curve match on the data.
  for (let i = 0; i < searchSize; i++) {
    difference += Math.abs(this.frequencyBuffer[i] -
      this.frequencyBuffer[i + s])
  }

  difference /= searchSize

  if (difference < smallestDifference) {
    smallestDifference = difference
    actualFrequency = s
  }

  if (difference < tolerance) {
    actualFrequency = s
    break
  }
}

this.lastRms = rms
// return this.audioCtx.sampleRate / actualFrequency
