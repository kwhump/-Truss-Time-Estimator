
document.getElementById("trussForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const size = document.getElementById("size").value.trim();
  const connection = document.getElementById("connection").value;
  const design = document.getElementById("design").value;
  const powder = document.getElementById("powder").value;

  const output = document.getElementById("output");
  output.textContent = calculateTrussTime(size, connection, design, powder);
});

function calculateTrussTime(size, connection, design, powder) {
  const sizeMatch = size.match(/(\d+)(m)?$/i);
  if (!sizeMatch) return "❌ Invalid truss size format.";

  const isMetric = sizeMatch[2];
  const lastSize = isMetric ? sizeMatch[1] + "M" : sizeMatch[1];
  const minutes = {
    "120": { box: 74, back: 68, gusset: 101, ladder: 38, backLadder: 25, powder: 16, weight: 2.5 },
    "96":  { box: 64, back: 62, gusset: 91,  ladder: 36, backLadder: 24, powder: 16, weight: 2.21 },
    "72":  { box: 62, back: 56, gusset: 88,  ladder: 32, backLadder: 21, powder: 16, weight: 1.92 },
    "60":  { box: 60, back: 43, gusset: 87,  ladder: 29, backLadder: 19, powder: 16, weight: 1.63 },
    "48":  { box: 52, back: 34, gusset: 80,  ladder: 24, backLadder: 15, powder: 8,  weight: 1.34 },
    "36":  { box: 50, back: 32, gusset: 76,  ladder: 20, backLadder: 13, powder: 5.3,weight: 1.05 },
    "24":  { box: 45, back: 28, gusset: 72,  ladder: 18, backLadder: 11, powder: 5.3,weight: 0.76 },
    "144": { box: 84, back: 75, gusset: 110, ladder: 40, backLadder: 27, powder: 0,  weight: 0 },
    "3M":  { box: 188.24, back: 0, gusset: 164.92, ladder: 0, backLadder: 0, powder: 0, weight: 0 },
    "2.5M": { box: 181.69, back: 0, gusset: 157.56, ladder: 0, backLadder: 0, powder: 0, weight: 0 },
    "2M":  { box: 175, back: 0, gusset: 150, ladder: 0, backLadder: 0, powder: 0, weight: 0 },
    "1.5M":{ box: 169, back: 0, gusset: 143, ladder: 0, backLadder: 0, powder: 0, weight: 0 },
    "1M":  { box: 162, back: 0, gusset: 143, ladder: 0, backLadder: 0, powder: 0, weight: 0 },
  };

  const data = minutes[lastSize];
  if (!data) return `❌ No data found for size: ${lastSize}`;

  let fabricationTime = 0;
  let notes = [];

  // Main fabrication
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

  // Camlocks for bolting
  if (connection === "bolting") {
    fabricationTime += 100;
    notes.push(`Camlocks: 100 min`);
  }

  // Forkend drilling
  let forkendTime = 0;
  if (connection === "forkended") {
    forkendTime = 67.2;
    notes.push(`Fixed Forkend Drilling: ${forkendTime} min`);
  }

  // Powder coating
  let powderTime = 0;
  let powderWeight = 0;
  if (powder === "yes") {
    powderTime = data.powder;
    powderWeight = data.weight;
    notes.push(`Powder Coating Time: ${powderTime} min`);
    notes.push(`Powder Coating Weight: ${powderWeight} lbs`);
  }

  // Finalize
  const finalizeTime = 12.5;
  notes.push(`Finalize Time: ${finalizeTime} min`);

  const total = fabricationTime + forkendTime + finalizeTime + powderTime;

  return `Fabrication Time: ${fabricationTime.toFixed(2)} min\n` +
         (forkendTime ? `Forkend Drilling Time: ${forkendTime} min\n` : "") +
         `Finalize Time: ${finalizeTime} min\n` +
         (powderTime ? `Powder Coating Time: ${powderTime} min\n` : "") +
         (powderWeight ? `Powder Weight: ${powderWeight} lbs\n` : "") +
         `\nTotal Time: ${total.toFixed(2)} min\n\nDetails:\n` + notes.join("\n");
}
