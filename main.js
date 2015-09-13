
var VSHADER_SOURCE =
'uniform mat4 u_ModelMatrix;\n' + 
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' + 
'varying vec4 v_Color;\n' + 
'void main() {\n' +
'  gl_Position = u_ModelMatrix * a_Position;\n' +
'  v_Color = a_Color;\n' + // Pass the data to the fragment shader
'}\n';

var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif GL_ES\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
'  gl_FragColor = v_Color;\n' +
'}\n';

var ANGLE_STEP = 30.0;
var floatsPerVertex = 7;
 var currentAngle = 0.0;

// Global vars for mouse click-and-drag for rotation.
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    
    // Write the positions of vertices into an array, transfer
    // array contents to a Vertex Buffer Object created in the
    // graphics hardware.
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
    
    // Register the Mouse & Keyboard Event-handlers
    canvas.onmousedown	=	function(ev){myMouseDown( ev, gl, canvas) };
    
    canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };
    
    canvas.onmouseup = 		function(ev){myMouseUp(   ev, gl, canvas)};

    // Register all keyboard events found within our HTML webpage window:
	  window.addEventListener("keydown", myKeyDown, false);
	  window.addEventListener("keyup", myKeyUp, false);
	  window.addEventListener("keypress", myKeyPress, false);
    
    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);
    
    // Get storage location of u_ModelMatrix
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    
    var modelMatrix = new Matrix4();
    
    // Start drawing
    var tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
        requestAnimationFrame(tick, canvas);   // Request that the browser calls tick
    };
    tick();

}

function initVertexBuffers(gl) { 
    makeSphere();
    makeRobot();
    makeTriangle();
    makeCylinder();
    
    var mySiz = sphVerts.length;
    var robotSiz = vertices2.length;
    var r = robotSiz/floatsPerVertex;
    var nn = mySiz/floatsPerVertex;
    var triSiz = triangle.length;
    var t = triSiz/floatsPerVertex;
    var cSiz = cylVerts.length;
    var c = cSiz/floatsPerVertex;
    var total = mySiz + robotSiz + triSiz + cSiz;
    var vertices = new Float32Array (total);
    var n = r + nn + t + c;
    
    i = 0;
    for(j=0; j<vertices2.length; i++, j++){
        vertices[i] = vertices2[j];
    }
    
    sphStart = i;						
    for(j=0; j< sphVerts.length; i++, j++) {
        vertices[i] = sphVerts[j];
    }
    
    triStart = i;
    for(j=0; j<triangle.length; i++, j++){
        vertices[i] = triangle[j];
    }
    
    cylStart = i;
    for(j=0; j<cylVerts.length; i++, j++){
        vertices[i] = cylVerts[j];
    }
    
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    
    // Assign the buffer object to a_Position variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * floatsPerVertex, 0); 
    gl.enableVertexAttribArray(a_Position);
    
    // Get the storage location of a_Position, assign buffer and enable
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
    gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return n;
}

function makeRobot() {
vertices2 = new Float32Array ([
                                       
                                       // back face: GREEN
                                       0.01, 0.50, 0.0, 1.0,         0.0, 1.0, 0.0,	// a
                                       0.20, 0.50, 0.0, 1.0,         0.0, 1.0, 0.0,	// b
                                       0.01, 0.10, 0.0, 1.0,         0.0, 1.0, 0.0,  // d
                                       
                                       0.20, 0.50, 0.0, 1.0,         0.0, 1.0, 0.0,	// b
                                       0.20, 0.10, 0.0, 1.0,         0.0, 1.0, 0.0,	// c
                                       0.01, 0.10, 0.0, 1.0,         0.0, 1.0, 0.0,	// d
                                       
                                       // right face: CYAN
                                       0.20, 0.50, 0.0, 1.0,         0.0, 1.0, 1.0,	// b
                                       0.20, 0.50, -0.10, 1.0,       0.0, 1.0, 1.0,	// f
                                       0.20, 0.10, 0.0, 1.0,         0.0, 1.0, 1.0,	// c
                                       
                                       0.20, 0.50, -0.10, 1.0,       0.0, 1.0, 1.0,	// f
                                       0.20, 0.10, -0.10, 1.0,       0.0, 1.0, 1.0,	// g
                                       0.20, 0.10, 0.0, 1.0,         0.0, 1.0, 1.0,	// c
                                       
                                       // top face: MAGENTA
                                       0.20, 0.50, 0.0, 1.0,         1.0, 0.0, 1.0,	// b
                                       0.01, 0.50, 0.0, 1.0,         1.0, 0.0, 1.0,	// a
                                       0.20, 0.50, -0.10, 1.0,       1.0, 0.0, 1.0,	// f
                                       
                                       0.01, 0.50, 0.0, 1.0,         1.0, 0.0, 1.0,	// a
                                       0.01, 0.50, -0.10, 1.0,       1.0, 0.0, 1.0,	// e
                                       0.20, 0.50, -0.10, 1.0,       1.0, 0.0, 1.0,	// f
                                       
                                       // left face: BLUE
                                       0.01, 0.50, -0.10, 1.0,       0.0, 0.0, 1.0,	// e
                                       0.01, 0.50, 0.0, 1.0,         0.0, 0.0, 1.0,	// a
                                       0.01, 0.10, -0.10, 1.0,       0.0, 0.0, 1.0,	// h
                                       
                                       0.01, 0.50, 0.0, 1.0,         0.0, 0.0, 1.0,	// a
                                       0.01, 0.10, 0.0, 1.0,         0.0, 0.0, 1.0,	// d
                                       0.01, 0.10, -0.10, 1.0,       0.0, 0.0, 1.0,	// h
                                       
                                       // bottom face: YELLOW
                                       0.20, 0.10, 0.0, 1.0,         1.0, 1.0, 0.1,	// c
                                       0.01, 0.10, 0.0, 1.0,         1.0, 1.0, 0.1,	// d
                                       0.20, 0.10, -0.10, 1.0,       1.0, 1.0, 0.1,	// g
                                       
                                       0.01, 0.10, 0.0, 1.0,         1.0, 1.0, 0.1,	// d
                                       0.01, 0.10, -0.10, 1.0,       1.0, 1.0, 0.1,	// h
                                       0.20, 0.10, -0.10, 1.0,       1.0, 1.0, 0.1,	// g
                                       
                                       // front face: RED
                                       0.01, 0.50, -0.10, 1.0,		1.0, 0.0, 0.0,	// e
                                       0.20, 0.50, -0.10, 1.0,		1.0, 0.0, 0.0,	// f
                                       0.01, 0.10, -0.10, 1.0,       1.0, 0.0, 0.0,  // h
                                       
                                       0.20, 0.50, -0.10, 1.0,       1.0, 0.0, 0.0,	// f
                                       0.20, 0.10, -0.10, 1.0,       1.0, 0.0, 0.0,	// g
                                       0.01, 0.10, -0.10, 1.0,       1.0, 0.0, 0.0,	// h
                                       
                                       ]);
    var robotn = 36;
}

function makeSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive
    var slices = 13;		// # of slices of the sphere along the z axis
    var sliceVerts	= 27;	// # of vertices around the top edge of the slice
    var topColr = new Float32Array([0.7, 0.7, 0.7]);	
    var equColr = new Float32Array([0.3, 0.7, 0.3]);	
    var botColr = new Float32Array([0.9, 0.9, 0.9]);	
    var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice
    
	// Create a (global) array to hold this sphere's vertices:
    sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
    
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {
			if(v%2==0)
			{			
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);
				sphVerts[j+2] = cos0;
				sphVerts[j+3] = 1.0;
			}
			else { 	
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
				sphVerts[j+3] = 1.0;																				// w
			}
			if(s==0) {	
				sphVerts[j+4]=topColr[0]; 
				sphVerts[j+5]=topColr[1]; 
				sphVerts[j+6]=topColr[2]; 
            }
			else if(s==slices-1) {
				sphVerts[j+4]=botColr[0];
				sphVerts[j+5]=botColr[1]; 
				sphVerts[j+6]=botColr[2]; 
			}
			else {
                sphVerts[j+4]=Math.random();
                sphVerts[j+5]=Math.random();
                sphVerts[j+6]=Math.random();
			}
		}
	}
}


function makeTriangle () {
    var c30 = Math.sqrt(0.75);					
    var sq2	= Math.sqrt(2.0);
triangle = new Float32Array([
                                        // Face 0: (left side)
                                        0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0
                                        c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1
                                        0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	// Node 2
                                        // Face 1: (right side)
                                        0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0
                                        0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	// Node 2
                                        -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3
                                        // Face 2: (lower side)
                                        0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0 
                                        -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3
                                        c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1 
                                        // Face 3: (base side)  
                                        -c30, -0.5,  0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3
                                        0.0,  1.0,  0.0, 1.0,  	1.0,  0.0,  0.0,	// Node 2
                                        c30, -0.5,  0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1
                                        ]);
}

function makeCylinder() {
    //==============================================================================
    // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive
    
    var ctrColr = new Float32Array([0.0, 1.0, 1.0]);	
    var topColr = new Float32Array([0.0, 1.0, 1.0]);	
    var botColr = new Float32Array([1.0, 1.0, 1.0]);	
    var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.0;		// radius of bottom of cylinder (top always 1.0)
    
    // Create a (global) array to hold this cylinder's vertices;
    cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
    
	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {
		// skip the first vertex--not needed.
		if(v%2==0)
		{				
			cylVerts[j  ] = 0.0; 			
			cylVerts[j+1] = 0.0;
			cylVerts[j+2] = 1.0;
			cylVerts[j+3] = 1.0;			
			cylVerts[j+4]=ctrColr[0];
			cylVerts[j+5]=ctrColr[1];
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w
			cylVerts[j+4]=topColr[0];
			cylVerts[j+5]=topColr[1];
			cylVerts[j+6]=topColr[2];			
		}
	}
    // Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	
		{
            cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
            cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
            cylVerts[j+2] = 1.0;	// z
            cylVerts[j+3] = 1.0;	// w
            cylVerts[j+4]=topColr[0];
            cylVerts[j+5]=topColr[1];
            cylVerts[j+6]=topColr[2];
		}
		else		
		{
            cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
            cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
            cylVerts[j+2] =-1.0;	// z
            cylVerts[j+3] = 1.0;	// w
            cylVerts[j+4]=botColr[0];
            cylVerts[j+5]=botColr[1]; 
            cylVerts[j+6]=botColr[2];			
		}
	}
    // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w
			cylVerts[j+4]=botColr[0];
			cylVerts[j+5]=botColr[1];
			cylVerts[j+6]=botColr[2];
		}
		else {				
			cylVerts[j  ] = 0.0; 			
			cylVerts[j+1] = 0.0;
			cylVerts[j+2] =-1.0;
			cylVerts[j+3] = 1.0;			
			cylVerts[j+4]=botColr[0];
			cylVerts[j+5]=botColr[1];
			cylVerts[j+6]=botColr[2];
		}
	}
}



function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
    //==============================================================================
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelMatrix.setTranslate(-0.7, -0.6, 0.0); 
    modelMatrix.rotate(-60.0, 0, 50, 1);
    modelMatrix.rotate(currentAngle, 0, 1, 1); 
	  modelMatrix.translate(-0.1, 0,0);						  
    
    // Mouse-Dragging for Rotation:
	  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
    
    modelMatrix.translate(dist, yMdragTot+0.0001, -xMdragTot+0.0001, 0.0);

    // Pass our current matrix to the vertex shaders:
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    // Draw the rectangle held in the VBO we created in initVertexBuffers().
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLE, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    
    // Draw head
    modelMatrix.translate(0.1, 0.46, 0);
    modelMatrix.scale(0.6,0.35,0.6);
    modelMatrix.translate(-0.1, 0, 0);			
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    
	  modelMatrix.translate(0.25, -0.30, 0.0);	

	  pushMatrix(modelMatrix);

	  modelMatrix.scale(1.0, 0.5, 4.0);	
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    

    modelMatrix.translate(-0.50, 0.0, 0.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    
    modelMatrix.translate(0.57, -1.15, 0.0);
    modelMatrix.scale(0.8, 3.0, 0.4);
    modelMatrix.rotate(180, 0,0,1);
    modelMatrix.rotate(currentAngle, 1, 0, 0);
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    
    // Draw right shin
    modelMatrix.translate(0.0, 0.4, 0.0);
    modelMatrix.scale(1.0, 0.7, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    
    // Draw left thigh
    modelMatrix.translate(0.3, -0.6, 0.0);
    modelMatrix.scale(1.0, 1.45, 1.0);
    modelMatrix.rotate(-2*currentAngle, 1,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    // Draw left shin
    modelMatrix.translate(0.0, 0.40, 0.0);
    modelMatrix.scale(1.0, 0.7, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    modelMatrix.setTranslate(-0.4, -0.4, 0);
    modelMatrix.translate(1.0, 1.0, 0);
    modelMatrix.scale(1,1,-1);							
    modelMatrix.scale(0.2, 0.2, 0.2);
    modelMatrix.rotate(90, 0,1,0);
    modelMatrix.rotate(currentAngle*0.5, 0, 1, 0);  

    // Mouse-Dragging for Rotation:
    modelMatrix.translate(dist, yMdragTot+0.0001, xMdragTot+0.0001, 0.0);

	  // Pass our current matrix to the vertex shaders:
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    // Draw just the sphere's vertices
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart/floatsPerVertex, sphVerts.length/floatsPerVertex);
    
    
    // Draw Pyramid
    modelMatrix.translate(0,-1.32, 0.0);
    modelMatrix.scale(1,1,-1);						
    modelMatrix.rotate(-90, 0, 1, 0);
    modelMatrix.rotate(15, 1, 0, 0);
    modelMatrix.scale(0.35, 0.35, 0.35);
    modelMatrix.rotate(currentAngle*3, 0, 1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, triStart/floatsPerVertex, triangle.length/floatsPerVertex);
   
    // Draw Cylinder:
    modelMatrix.translate(0.0, -0.66, 0);
    modelMatrix.scale(0.15, 0.15, 0.15);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.rotate(currentAngle, 1.0, 1.1, 1.0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);							
    modelMatrix.rotate(-1*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP,				
                  cylStart/floatsPerVertex, 
                  cylVerts.length/floatsPerVertex);	
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);						
    modelMatrix.rotate(-1*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP,				
                  cylStart/floatsPerVertex,
                  cylVerts.length/floatsPerVertex);	
    
    // Draw Balloon Tail:
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(-1*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(-1*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(-1*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
 
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.25*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(-0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(-0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0); //***
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0); //***
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0); //***
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, 1, 0); //***
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(0.5*currentAngle, 0, -1, 0); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, -1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    // Draw Cylinder:
    modelMatrix.translate(0.0, 0.0, 2.0);
    modelMatrix.scale(1.0,1.0,1.0);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    
    
}

var g_last = Date.now();

function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    
    // Update the current rotation angle (adjusted by the elapsed time)
    if(angle >   10.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if(angle <  -10.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
    
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

function Faster() {
    if (currentAngle > 0 && ANGLE_STEP > 0)
        ANGLE_STEP += 10;
    if (currentAngle <0 && ANGLE_STEP < 0)
        ANGLE_STEP -= 10;
    if (ANGLE_STEP == 0)
        ANGLE_STEP += 10;
}

function Slower() {   
    if (currentAngle > 0 && ANGLE_STEP > 0)
        ANGLE_STEP -= 10;
    if (currentAngle <0 && ANGLE_STEP < 0)
        ANGLE_STEP += 10;
}

function Stop_Start() {
    if(ANGLE_STEP*ANGLE_STEP > 1) {
        myTmp = ANGLE_STEP;
        ANGLE_STEP = 0;
    }
    else {
        ANGLE_STEP = myTmp;
    }
}

function Reset_Speed() {
    ANGLE_STEP = 30.0;
}

// Mouse and Keyboard event-handling Callbacks
function myMouseDown(ev, gl, canvas) {
    var rect = ev.target.getBoundingClientRect();	
    var xp = ev.clientX - rect.left;									
    var yp = canvas.height - (ev.clientY - rect.top);	
    
	  // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
    (canvas.width/2);			
	var y = (yp - canvas.height/2) /		
    (canvas.height/2);
	
	isDrag = true; // set mouse-dragging flag
	xMclik = x; // record where mouse-dragging began
	yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
    // Called when user MOVES the mouse with a button already pressed down.
    
	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'
    
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;									
	  var yp = canvas.height - (ev.clientY - rect.top);	
    
	  // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
    (canvas.width/2);			
	  var y = (yp - canvas.height/2) /		
    (canvas.height/2);
    
	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here
	yMclik = y;
};


function myMouseUp(ev, gl, canvas) {
    // Called when user RELEASES mouse button pressed previously.
    
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;									
	  var yp = canvas.height - (ev.clientY - rect.top);
    
	  // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
    (canvas.width/2);			
	  var y = (yp - canvas.height/2) /											 
    (canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false; // CLEAR mouse-dragging flag
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};


function myKeyDown(ev) {
    // Called when user presses down ANY key on the keyboard, and captures the
    // keyboard's scancode or keycode(varies for different countries and alphabets).
    
	switch(ev.keyCode) {			
		case 37:		// left-arrow key
			console.log(' left-arrow.');
            document.getElementById('Result').innerHTML =
  			' Left Arrow:keyCode='+ev.keyCode;
            modelMatrix.translate(-1.0, 1, 0, 0);
			break;
		case 38:		// up-arrow key
			console.log('   up-arrow.');
            document.getElementById('Result').innerHTML =
  			'   Up Arrow:keyCode='+ev.keyCode;
			break;
		case 39:		// right-arrow key
			console.log('right-arrow.');
            document.getElementById('Result').innerHTML =
  			'Right Arrow:keyCode='+ev.keyCode;
            break;
		case 40:		// down-arrow key
			console.log(' down-arrow.');
            document.getElementById('Result').innerHTML =
  			' Down Arrow:keyCode='+ev.keyCode;
            break;
		default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
            document.getElementById('Result').innerHTML =
  			'myKeyDown()--keyCode='+ev.keyCode;
			break;
	}
}

function myKeyUp(ev) {
    // Called when user releases ANY key on the keyboard; captures scancodes well 
	  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
    
    if(ANGLE_STEP*ANGLE_STEP > 1) {
        myTmp = ANGLE_STEP;
        ANGLE_STEP = 0;
    }
    else {
        ANGLE_STEP = myTmp;
    }
}

function myKeyPress(ev) {
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
                ', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
                ', altKey='   +ev.altKey   +
                ', metaKey(Command key or Windows key)='+ev.metaKey);
}

function clearDrag() {
    // Called when user presses 'Clear' button in our webpage
	xMdragTot = 0.0;
	yMdragTot = 0.0;
}

window.addEventListener("keydown", moveSomething, false);

function moveSomething(e) {
    switch(e.keyCode) {
        case 37: //left key pressed    
            break;
        case 38: // up key pressed
            ANGLE_STEP += 20;
            break;
        case 39:
            // right key pressed
            break;
        case 40: // down key pressed
            ANGLE_STEP -=20;
            break;
    }
}
