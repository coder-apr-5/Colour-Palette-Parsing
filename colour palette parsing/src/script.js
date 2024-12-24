function visualizeIEColor(input) {
  const steps = [];
  let workingValue = input;

  // Step 1: Initial Cleanup
  const originalHasHash = workingValue.startsWith("#");
  if (originalHasHash) {
    steps.push({
      title: "1. Initial Cleanup",
      content: `Remove octothorpe: "${workingValue}" → "${workingValue.slice(1)}"`,
      value: workingValue.slice(1)
    });
    workingValue = workingValue.slice(1);
  } else {
    steps.push({
      title: "1. Initial Cleanup",
      content: "Step skipped: No octothorpe (#) found at start of value",
      value: workingValue
    });
  }

  // Step 2: Replace Invalid Characters
  const nonHexPattern = /[^0-9a-f]/gi;
  const hasNonHex = nonHexPattern.test(workingValue);
  if (hasNonHex) {
    const replacedValue = workingValue.replace(nonHexPattern, "0");
    steps.push({
      title: "2. Replace Invalid Characters",
      content: `Replace non-hex characters: "${workingValue}" → "${replacedValue}"`,
      value: replacedValue
    });
    workingValue = replacedValue;
  } else {
    steps.push({
      title: "2. Replace Invalid Characters",
      content: "Step skipped: All characters are valid hexadecimal (0-9, A-F)",
      value: workingValue
    });
  }

  // Step 3: Standardise Length
  const needsPadding = workingValue.length === 0 || workingValue.length % 3 !== 0;
  if (needsPadding) {
    let standardizedLength = workingValue;
    while (standardizedLength.length === 0 || standardizedLength.length % 3 !== 0) {
      standardizedLength += "0";
    }
    steps.push({
      title: "3. Standardise Length",
      content: `Pad to multiple of 3: "${workingValue}" → "${standardizedLength}"`,
      value: standardizedLength
    });
    workingValue = standardizedLength;
  } else {
    steps.push({
      title: "3. Standardise Length",
      content: `Step skipped: Length (${workingValue.length}) is already a multiple of 3`,
      value: workingValue
    });
  }

  // Step 4: Split into RGB Components
  const partLength = Math.floor(workingValue.length / 3);
  const parts = [
    workingValue.slice(0, partLength),
    workingValue.slice(partLength, partLength * 2),
    workingValue.slice(partLength * 2)
  ];
  steps.push({
    title: "4. Split into RGB Components",
    content: `Split into:\nRed: "${parts[0]}"\nGreen: "${parts[1]}"\nBlue: "${parts[2]}"`,
    value: parts.join(",")
  });

  // Step 5: Handle Length
  let processedParts = [...parts];
  let lengthStepContent = [];
  let lengthProcessingNeeded = false;

  // 5a: Truncate to 8 if longer
  if (partLength > 8) {
    lengthProcessingNeeded = true;
    const beforeParts = [...processedParts];
    processedParts = parts.map(part => part.slice(-8));
    lengthStepContent.push(
      `Truncate to 8 characters:\nRed: "${beforeParts[0]}" → "${processedParts[0]}"\nGreen: "${beforeParts[1]}" → "${processedParts[1]}"\nBlue: "${beforeParts[2]}" → "${processedParts[2]}"`
    );
  }

  // 5b: Remove leading zeros while length > 2 and all start with 0
  let leadingZerosRemoved = false;
  while (
    processedParts[0].length > 2 &&
    processedParts.every(part => part.startsWith("0"))
  ) {
    lengthProcessingNeeded = true;
    leadingZerosRemoved = true;
    const beforeParts = [...processedParts];
    processedParts = processedParts.map(part => part.slice(1));
    lengthStepContent.push(
      `Remove leading zeros:\nRed: "${beforeParts[0]}" → "${processedParts[0]}"\nGreen: "${beforeParts[1]}" → "${processedParts[1]}"\nBlue: "${beforeParts[2]}" → "${processedParts[2]}"`
    );
  }

  // 5c: Truncate to first 2 if still longer
  if (processedParts[0].length > 2) {
    lengthProcessingNeeded = true;
    const beforeParts = [...processedParts];
    processedParts = processedParts.map(part => part.slice(0, 2));
    lengthStepContent.push(
      `Truncate to first 2 characters:\nRed: "${beforeParts[0]}" → "${processedParts[0]}"\nGreen: "${beforeParts[1]}" → "${processedParts[1]}"\nBlue: "${beforeParts[2]}" → "${processedParts[2]}"`
    );
  }

  steps.push({
    title: "5. Handle Length",
    content: lengthProcessingNeeded 
      ? lengthStepContent.join("\n\n")
      : `Step skipped: Components already at correct length (${processedParts[0].length} characters)\nRed: "${processedParts[0]}"\nGreen: "${processedParts[1]}"\nBlue: "${processedParts[2]}"`,
    value: processedParts.join(",")
  });

  // Step 6: Final Assembly
  const finalColor = processedParts.join("");
  steps.push({
    title: "6. Final Assembly",
    content: `Combine RGB components: ${processedParts.join(" + ")} = ${finalColor}`,
    value: finalColor
  });

  return {
    steps,
    finalColor
  };
}

function updateVisualization() {
  const input = colorInput.value;
  const { steps, finalColor } = visualizeIEColor(input);

  const stepsContainer = document.getElementById("steps");
  stepsContainer.innerHTML = steps
    .map(
      (step) => `
        <div class="step">
          <div class="step-title">${step.title}</div>
          <pre class="step-content">${step.content}</pre>
        </div>
      `
    )
    .join("");

  const colorHex = "#" + finalColor;
  colorBox.style.backgroundColor = colorHex;
  colorCode.textContent = colorHex;
}

const colorInput = document.getElementById("colorInput");
const colorBox = document.getElementById("colorBox");
const colorCode = document.getElementById("colorCode");

colorInput.addEventListener("input", updateVisualization);

colorInput.value = "chucknorris";
updateVisualization();