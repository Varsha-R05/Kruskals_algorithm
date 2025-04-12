let nodes = [];
let edges = [];
let mst = [];
let originalEdges = [];

function setup() {
    let canvas = createCanvas(600, 600);
    canvas.parent("canvas-holder");
    generateGraph();
}

function draw() {
    background(240);
    drawGraph();
}
function showSection(sectionId) {
    let sections = document.querySelectorAll(".section");
    sections.forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(sectionId).style.display = "block";
}

// Generate a simple, well-spaced graph with no duplicate edges
function generateGraph() {
    nodes = [];
    edges = [];
    mst = [];

    let numNodes = floor(random(6, 9)); // Between 6 to 8 nodes

    let attempts = 0;
    while (nodes.length < numNodes && attempts < 1000) {
        let x = random(100, width - 100);
        let y = random(100, height - 100);

        // Ensure nodes are far apart (Minimum 120 pixels)
        let tooClose = nodes.some(node => dist(node.x, node.y, x, y) < 120);
        if (!tooClose) {
            nodes.push({ x, y, degree: 0 });
        }

        attempts++;
    }

    let adjacencyMatrix = Array.from({ length: numNodes }, () => Array(numNodes).fill(false));

    let possibleEdges = [];
    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            possibleEdges.push({ u: i, v: j, weight: floor(random(1, 20)) });
        }
    }

    // Sort edges by distance to avoid overlapping edges
    possibleEdges.sort((a, b) => {
        let distA = dist(nodes[a.u].x, nodes[a.u].y, nodes[a.v].x, nodes[a.v].y);
        let distB = dist(nodes[b.u].x, nodes[b.u].y, nodes[b.v].x, nodes[b.v].y);
        return distA - distB;
    });

    for (let edge of possibleEdges) {
        if (!adjacencyMatrix[edge.u][edge.v] && nodes[edge.u].degree < 3 && nodes[edge.v].degree < 3) {
            edges.push(edge);
            nodes[edge.u].degree++;
            nodes[edge.v].degree++;
            adjacencyMatrix[edge.u][edge.v] = adjacencyMatrix[edge.v][edge.u] = true; // Mark edge added
        }
    }

    originalEdges = JSON.parse(JSON.stringify(edges)); // Save original edges
    draw();
}

// Function to draw edges without overlap
function drawEdge(u, v, color, weight) {
    let dx = v.x - u.x;
    let dy = v.y - u.y;
    let distance = dist(u.x, u.y, v.x, v.y);

    let shortenFactor = 20 / distance;
    let x1 = u.x + dx * shortenFactor;
    let y1 = u.y + dy * shortenFactor;
    let x2 = v.x - dx * shortenFactor;
    let y2 = v.y - dy * shortenFactor;

    stroke(color);
    strokeWeight(weight);
    line(x1, y1, x2, y2);
}

// Draw the graph
function drawGraph() {
    background(240);

    // Draw normal edges first
    edges.forEach(edge => {
        let u = nodes[edge.u];
        let v = nodes[edge.v];

        if (!mst.includes(edge)) {
            drawEdge(u, v, color(0), 2); // Black edges
        }
    });

    // Draw MST edges in green
    drawMST();

    // Draw nodes
    nodes.forEach((node, index) => {
        fill(255);
        stroke(0);
        strokeWeight(2);
        ellipse(node.x, node.y, 40, 40);

        // Draw vertex label (NOT bold)
        fill(0);
        textSize(18);
        textAlign(CENTER, CENTER);
        noStroke();
        text(index, node.x, node.y);
    });

    // Draw weight labels
    drawEdgeWeights();
}

// Function to draw edge weights precisely at the center of the edge
function drawEdgeWeights() {
    edges.forEach(edge => {
        let u = nodes[edge.u];
        let v = nodes[edge.v];

        // Find the exact middle point of the edge
        let midX = (u.x + v.x) / 2;
        let midY = (u.y + v.y) / 2;

        // Draw a small white rectangle behind the weight to ensure visibility
        fill(255);
        stroke(240);
        rect(midX - 14, midY - 10, 28, 18, 5);

        // Draw the weight exactly at the center
        fill(0);
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text(edge.weight, midX, midY);
    });
}


// Run Kruskal's Algorithm with step-by-step visualization
async function runKruskal() {
    let parent = [];
    for (let i = 0; i < nodes.length; i++) {
        parent.push(i);
    }

    // Sort edges by weight
    edges.sort((a, b) => a.weight - b.weight);
    mst = [];

    function find(i) {
        if (parent[i] === i) return i;
        return parent[i] = find(parent[i]);
    }

    function union(u, v) {
        parent[find(u)] = find(v);
    }

    const stepLog = document.getElementById("step-log");
    stepLog.innerHTML = "<strong>Sorted Edges (by weight):</strong><br>";

    edges.forEach(edge => {
        stepLog.innerHTML += `(${edge.u}, ${edge.v}) → weight ${edge.weight}<br>`;
    });

    stepLog.innerHTML += `<br><strong>Steps:</strong><br>`;
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (let edge of edges) {
        let setU = find(edge.u);
        let setV = find(edge.v);

        const edgeText = `Edge (${edge.u}, ${edge.v}) with weight ${edge.weight}`;

        if (setU !== setV) {
            mst.push(edge);
            union(setU, setV);
            stepLog.innerHTML += `${edgeText} → Added to MST<br>`;
            draw();
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            stepLog.innerHTML += `${edgeText} → Forms cycle, skipped<br>`;
        }

        stepLog.scrollTop = stepLog.scrollHeight;

        
    }

    draw();

    // ✅ Show the minimum cost after building MST
    const totalCost = mst.reduce((sum, edge) => sum + edge.weight, 0);
    const finalLine = document.createElement("div");
    finalLine.style.marginTop = "15px";
    finalLine.style.fontWeight = "bold";
    finalLine.style.fontSize = "16px";
    finalLine.style.color = "#27ae60";
    finalLine.innerText = `Minimum Cost of MST: ${totalCost}`;
    stepLog.appendChild(finalLine);
    stepLog.scrollTop = stepLog.scrollHeight;
}




// Draw MST edges
function drawMST() {
    mst.forEach(edge => {
        let u = nodes[edge.u];
        let v = nodes[edge.v];
        drawEdge(u, v, color(0, 200, 0), 3); // Green MST edges
    });
}

// Reset graph to original state
function resetGraph() {
    mst = [];
    edges = JSON.parse(JSON.stringify(originalEdges)); // Restore original edges

    const stepLog = document.getElementById("step-log");
    if (stepLog) {
        stepLog.innerHTML = "<strong>Steps:</strong><br>"; // Clear steps
    }

    draw();
}


