document.getElementById("trussForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const sizeInput = document.getElementById("size").value.trim().toLowerCase();
  const connection = document.getElementById("connection").value;
  const design = document.getElementById("design").value;
  const powder = document.getElementById("powder").value;

  const output = document.getElementById("output");
  output.textContent = calculateTrussTime(sizeInput, connection, design, powder);
});

function calculateTrussTime(sizeInput, connection, design, powder) {
  const isCircle = sizeInput.includes("circle");

  // Grab the number after the last 'x' (e.g., 12x12x138 → 138)
  let sizeMatch = sizeInput.toLowerCase().split("circle")[0]; // trim anything after "circle"
  const xParts = sizeMatch.split("x");
  const lastPart = xParts[xParts.length - 1].match(/\d+/); // get the number from last part
  if (!lastPart) {
    return `❌ Could not find a valid size in: "${sizeInput}"`;
  }

  const inputSize = parseInt(lastPart[0]);

  const minutes = {
    144: { box: 84, back: 75, gusset: 110, ladder: 40, backLadder: 27, powder: 0, weight: 0 },
    120: { box: 74, back: 68, gusset: 101, ladder: 38, backLadder: 25, powder: 16, weight: 2.5 },
    96:  { box: 64, back: 62, gusset: 91, ladder: 36, backLadder: 24, powder: 16, weight: 2.21 },
    72:  { box: 62, back: 56, gusset: 88, ladder: 32, backLadder: 21, powder: 16, weight: 1.92 },
    60:  { box: 60, back: 43, gusset: 87, ladder: 29, backLadder: 19, powder: 16, weight: 1.63 },
    48:  { box: 52, back: 34, gusset: 80, ladder: 24, backLadder: 15, powder: 8, weight: 1.34 },
    36:  { box: 50, back: 32, gusset: 76, ladder: 20, backLadder: 13, powder: 5.3, weight: 1.05 },
    24:  { box: 45, back: 28, gusset: 72, ladder: 18, backLadder: 11, powder: 5.3, weight: 0.76 }
  };

  const sizes = Object.keys(minutes).map(Number).sort((a, b) => a - b);
  let lower = sizes[0];
  let upper = sizes[sizes.length - 1];

  for (let i = 0; i < sizes.length; i++) {
    if (sizes[i] === inputSize) {
      lower = upper = sizes[i];
      break;
    } else if (sizes[i] > inputSize) {
      upper = sizes[i];
      lower = sizes[i - 1] ?? sizes[i];
      break;
    }
  }

  let data;
  if (lower === upper) {
    data = minutes[lower];
  } else {
    const l = minutes[lower];
    const u = minutes[upper];
    const ratio = (inputSize - lower) / (upper - lower);
    data = {};
    for (let key of Object.keys(l)) {
      data[key] = parseFloat((l[key] + ratio * (u[key] - l[key])).toFixed(2));
    }
  }

  let fabricationTime = 0;
  let notes = [];

  if (design === "custom") {
    fabricationTime += data.gusset + (data.ladder * 2) + (data.backLadder * 2);
    notes.push(`Box Back Weld With Gussets: ${data.gusset} min`);
  } else {
    if (connection === "forkended") {
      fabricationTime += data.gusset;
      notes.push(`Box Back Weld With Gussets: ${data.gusset} min`);
    } else {
      fabricationTime += data.box + data.back;
      notes.push(`Box Assembly & Weld: ${data.box} min`);
      notes.push(`Box Back Weld: ${data.back} min`);
    }
    fabricationTime += data.ladder * 2;
    fabricationTime += data.backLadder * 2;
  }

  notes.push(`Ladder Assembly & Weld x2: ${data.ladder * 2} min`);
  notes.push(`Ladder Back Weld x2: ${data.backLadder * 2} min`);

  let forkendTime = 0;
  if (connection === "forkended") {
    forkendTime = 67.2;
    notes.push(`Fixed Forkend Drilling: ${forkendTime} min`);
  }

  let powderTime = 0;
  let powderWeight = 0;
  let powderWarning = "";
  let circlePowderNotice = "";

  const canPowderCoat = inputSize <= 120;

  if (powder === "yes") {
    if (!canPowderCoat) {
      powderWarning = `**NOTICE:** Truss exceeds maximum size (120") for in-house powder coating. Powder coating not applied.`;
    } else {
      powderTime = data.powder;
      powderWeight = data.weight;
      notes.push(`Powder Coating Time: ${powderTime} min`);
      notes.push(`Powder Weight: ${powderWeight} lbs`);
    }

    if (isCircle) {
      circlePowderNotice = `**NOTICE:** Powder coating circle trusses may require outsourcing depending on radius.`;
    }
  }

  const finalizeTime = 12.5;
  notes.push(`Finalize Time: ${finalizeTime} min`);

  let circleTime = 0;
  if (isCircle) {
    circleTime = 60 + 32 + 24 + 4;
    notes.push(`Circle Fabrication Weld: 60 min`);
    notes.push(`Tube Rolling (4): 32 min`);
    notes.push(`Tube Cutting (4): 24 min`);
    notes.push(`Tube Deburring (4): 4 min`);
  }

  const total = fabricationTime + forkendTime + finalizeTime + powderTime + circleTime;

  return (
    `Estimated size used: ${inputSize}" (between ${lower}" and ${upper}")\n` +
    (isCircle ? `Circle Truss: YES\n\n` : `\n`) +
    (powderWarning ? powderWarning + "\n\n" : "") +
    (circlePowderNotice ? circlePowderNotice + "\n\n" : "") +
    `Fabrication Time: ${fabricationTime.toFixed(2)} min\n` +
    (forkendTime ? `Forkend Drilling Time: ${forkendTime} min\n` : "") +
    `Finalize Time: ${finalizeTime} min\n` +
    (circleTime ? `Circle Extras: ${circleTime} min\n` : "") +
    (powderTime ? `Powder Coating Time: ${powderTime} min\n` : "") +
    (powderWeight ? `Powder Weight: ${powderWeight} lbs\n` : "") +
    `\nTotal Time: ${total.toFixed(2)} min\n\nDetails:\n` +
    notes.join("\n")
  );
}
