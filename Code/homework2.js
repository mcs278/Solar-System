// variables declaration
var canvas;
var gl;
var mat_view;
var mat_proj;
var pos_A;var pos_B;var pos_C;
var norm_A;var norm_B;var norm_C;
var x = 0; var y = -10; var z = 0;
var length = 0.5;
var time = 0.0;
var timer = new Timer();
var cam_hoz = 0; //heading
var cam_ver = 30; // pitch
N_keyboard=1;
var xprime = 0;
var yprime = 0;
var zprime = 0;
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var index = 0;
var posAttr;
var normAttr;
var pts_Arr = [];
var norm_Arr = [];
var UlightPos_vec3;
var Uamb_Val;var Uamb_Val_frag;
var Udiff_Val;var Udiff_Val_frag;
var Uspec_Val;var Uspec_Val_frag;
var uniform_shininess;var uniform_shininess2;
var velocity_rot = [1300, 23, 33, 83, 54, 93];
var velocity_Orb = [0, 23, 33, 83, 54, 93];
var planetScale = [4, .7, 1.1, 1, .5, .6];
var spheres_displacement = [0, 5, 7, 11, 15, 10];
var loc_center_zVal = -20;
var lightPos_vec3 = vec3(0, 0, 0);
var sun=vec4(1, .3, .3, 1);
var icy_gray=vec4(.9, .9, 1, 1);
var blue_green=vec4(0, .7, .7, 1);
var light_blue=vec4(.1, .4, .9, 1);
var brownish_orange=vec4(.9, .5, .2, 1);
var moon_yel= vec4(1, 1, 0, 1);
//light multiplied by the color for sun 1st,2nd,3rd,4th planets and the moon
var amb_Val = [
	mult(vec4(.4, .4, .4, 1), sun),
	mult(vec4(.4, .4, .4, 1), icy_gray),
	mult(vec4(.4, .4, .4, 1), blue_green),
	mult(vec4(.4, .4, .4, 1), light_blue),
	mult(vec4(.2, .2, .2, 1), brownish_orange),
	mult(vec4(.4, .4, .4, 1), moon_yel),
];
var diff_Val = [
	mult(vec4(.5, .5, .5, 1), sun),
	mult(vec4(.5, .5, .5, 1), icy_gray),
	mult(vec4(.5, .5, .5, 1), blue_green),
	mult(vec4(.5, .5, .5, 1), light_blue),
	mult(vec4(1, .6, .6, 1), brownish_orange),
	mult(vec4(.6, .6, .6, 1), moon_yel),
];
var spec_Val = [
	mult(vec4(.4, .4, .4, 1), sun),
	mult(vec4(0, 0, 0, 1), icy_gray),
	mult(vec4(.8, .8, .8, 1), blue_green),
	mult(vec4(1, 1, 1 , 1), light_blue),
	mult(vec4(.1, .1, .1, 1), brownish_orange),
	mult(vec4(.5, .5, .5, 1), moon_yel),
];
var shininess = 60;

var attach_detach = false;
var eye = vec3(0, 0, 0);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" ); // creating the canvas and checking for errors
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	document.onkeydown = function(e) {
		e = e || window.event;
		if(e.keyCode===49)
		{
			N_keyboard=1;
		}
		else if(e.keyCode===50)
        {
			N_keyboard=2;
		}
		else if(e.keyCode===51)
        {
			N_keyboard=3;
		}
		else if(e.keyCode===52)
        {
			N_keyboard=4;
		}
		else if(e.keyCode===53)
        {
			N_keyboard=5;
		}
		else if(e.keyCode===54)
		{
			N_keyboard=6;
		}
		else if(e.keyCode===55)
        {
			N_keyboard=7;
		}
		else if(e.keyCode===56)
        {
			N_keyboard=8;
		}		
		else if(e.keyCode===57)
        {
			N_keyboard=9;
		}		
		else if(e.keyCode===32 && !attach_detach) { // "space" (move camera forward) (REQUIREMENT 6)
			motion_func(cam_hoz, cam_ver, 0, N_keyboard);
			x-=xprime;
			y-=yprime;
			z-=zprime;
		}
		else if(e.keyCode===37) // "left" camera heading left
			cam_hoz-=N_keyboard;
		else if(e.keyCode===38 && !attach_detach) // "up"  camera pitch up
			cam_ver-=N_keyboard;
		else if(e.keyCode===39) // "right" camera heading right
			cam_hoz+=N_keyboard;
		else if(e.keyCode===40 && !attach_detach) // "down"  camera pitch down
			cam_ver+=N_keyboard;
		else if(e.keyCode===82) { // "r"  reset camera
			x = 0;
			y = -10;
			z = 0;
			cam_hoz = 0;
			cam_ver = 30;
			attach_detach = false;
			N_keyboard=1;
		}
		else if(e.keyCode===65) { // "a" attach camera to the planet
			attach_detach = true;
		}
		else if(e.keyCode===68) { // "g"  deattach camera
			attach_detach = false;
		}
	};

    gl.viewport( 0, 0, canvas.width, canvas.height );// setting viewport
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ); // clearing the colorbuffer
    gl.enable(gl.DEPTH_TEST); // enabling the depth or zbuffer
	//
    //  Load shaders and initialize attribute buffers
    //
	var program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.useProgram( program );
	//creating and binding the normal and position buffers low compexity/ numb of vertices (A cases)	
	sphere(va, vb, vc, vd, 2, 0, 0); //calling the sphere function given the values of Angel code 
    norm_A = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, norm_A);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(norm_Arr), gl.STATIC_DRAW);
	pos_A = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos_A);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pts_Arr), gl.STATIC_DRAW);
	//creating and binding the normal and position buffers medium compexity/ numb of vertices (B cases)
	sphere(va, vb, vc, vd, 3, 1, 1);
    norm_B = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, norm_B);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(norm_Arr), gl.STATIC_DRAW);
	pos_B = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos_B);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pts_Arr), gl.STATIC_DRAW);
	//creating and binding the normal and position buffers high compexity/ numb of vertices (c cases)
	sphere(va, vb, vc, vd, 4, 1, 1);
    norm_C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, norm_C);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(norm_Arr), gl.STATIC_DRAW);
	pos_C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos_C);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pts_Arr), gl.STATIC_DRAW);

	// enable buffers
	normAttr = gl.getAttribLocation(program, "normal_Vec3");
    gl.enableVertexAttribArray(normAttr);
    posAttr = gl.getAttribLocation(program, "position_Vec3");
    gl.enableVertexAttribArray(posAttr);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, norm_A);
    gl.vertexAttribPointer(normAttr, 4, gl.FLOAT, false, 0, 0);	
    gl.bindBuffer(gl.ARRAY_BUFFER, pos_A);
    gl.vertexAttribPointer(posAttr, 4, gl.FLOAT, false, 0, 0);

    // setting the booleans for gouraude per vertex
	Ugouraude_ver_boolean = gl.getUniformLocation(program, "gouraude_ver_boolean");
	Uphong_frag_boolean = gl.getUniformLocation(program, "phong_frag_boolean");
	//phong set up
	gl.uniform1f(Ugouraude_ver_boolean, false);
	gl.uniform1f(Uphong_frag_boolean, true);
	//setting up the sheader values of variables
    Umat_main = gl.getUniformLocation(program, "mat_main");
    uniform_pMatrix = gl.getUniformLocation(program, "pMatrix");
    Uamb_Val = gl.getUniformLocation(program, "amb_Val");
    Udiff_Val = gl.getUniformLocation(program, "diff_Val");
    Uspec_Val = gl.getUniformLocation(program, "spec_Val");
    uniform_shininess = gl.getUniformLocation(program, "shininess");
	Uamb_Val_frag = gl.getUniformLocation(program, "amb_Val_frag");
    Udiff_Val_frag = gl.getUniformLocation(program, "diff_Val_frag");
    Uspec_Val_frag = gl.getUniformLocation(program, "spec_Val_frag");
    uniform_shininess2 = gl.getUniformLocation(program, "shininess2");
	UlightPos_vec3 = gl.getUniformLocation(program, "lightPos_vec3");
   
	// setting the camera and the LookAt Note: i used the lookAt as also Angel used it in his code
    mat_view = lookAt(eye, at, up);
    mat_proj = perspective(90, 1, 0.001, 1000);
	
	// setting up the light matrix, rotation and translation to put it in the right spot
	Umat_light = gl.getUniformLocation(program, "mat_light");
	mat_light = mat_view;
	mat_light = mult(mat_light, rotate(cam_hoz, [0, 1, 0])); 
	
	if(attach_detach)
	{
		mat_light = mult(mat_light, rotate(0, [1, 0, 0]));
		mat_light = mult(mat_light, translate(vec3(x, 0, z))); 
	}
	else
	{
		mat_light = mult(mat_light, rotate(cam_ver, [1, 0, 0]));
		mat_light = mult(mat_light, translate(vec3(x, 0, z)))
	}
	mat_light = mult(mat_light, translate(vec3(0, 0, loc_center_zVal)));
	gl.uniformMatrix4fv(Umat_light, false, flatten(mat_light));
    timer.reset();
    gl.enable(gl.DEPTH_TEST);// enabling the depth or zbuffer
	
    render();
}

function render() {
	
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// clear color and depth buffer
	time += timer.getElapsedTime() / 1000;//setting up and incrementing the timer

	// if attached to planet, transform the camera to follow a planet's orbital path
	if(attach_detach) {
		
		// descend back into the same plane as the planets
		
		var eyeMatrix = mat4();
		eyeMatrix = mult(eyeMatrix, translate(vec3(0, 0, loc_center_zVal)));
		eyeMatrix = mult(eyeMatrix, rotate(-time*velocity_Orb[4], [0, 1, 0]));
		eyeMatrix = mult(eyeMatrix, translate(vec3(0, 0, spheres_displacement[4])));
	
		eye = vec3(eyeMatrix[0][0], eyeMatrix[0][1], eyeMatrix[0][2]);
		
		at = vec3(0, 0, 0);
		up = vec3(0, 1, 0);
		mat_view = lookAt(eye, at, up);

	}
	else {

		//reset camera
		eye = vec3(0, 0, 0);
		at = vec3(0, 0, 0);
		up = vec3(0, 1, 0);
		mat_view = lookAt(eye, at, up);

		
	}

	//drawing the spheres and passing the num_vertices and index (sun then  icy grey planet,
	//then blue-green planet, light blue planet, then orange brown planet.
	
	// if a planet uses Phong lighting, i call its function first before drawing it and same for
	// the gouraud light planets too
	draw_Sphere(0, 2); 
	draw_Sphere(1, 0); 
	Ugouraude_ver_fun();
	draw_Sphere(2, 0); 
	phong_frag_func();
	draw_Sphere(3, 2); 
	phong_frag_func();
	draw_Sphere(4, 1);
	
	// drawing the moon around the light blue planet
	gl.bindBuffer(gl.ARRAY_BUFFER, norm_A);
	gl.vertexAttribPointer(normAttr, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pos_A);
	gl.vertexAttribPointer(posAttr, 4, gl.FLOAT, false, 0, 0);
	// setting the light for the moon
	gl.uniform4fv(Uamb_Val, flatten(amb_Val[5]));
    gl.uniform4fv(Udiff_Val, flatten(diff_Val[5]));
    gl.uniform4fv(Uspec_Val, flatten(spec_Val[5]));
	gl.uniform4fv(Uamb_Val_frag, flatten(amb_Val[5]));
    gl.uniform4fv(Udiff_Val_frag, flatten(diff_Val[5]));
    gl.uniform4fv(Uspec_Val_frag, flatten(spec_Val[5]));
	// putting the moon in its place in orbit and rotate it . 
	// same place as 3rd planet, rotate, translate and scale and orbit by giving velocity
	mat_main = mat_view;
	mat_main = mult(mat_main, rotate(cam_hoz, [0, 1, 0])); 
	if(attach_detach)
	{
		mat_main = mult(mat_main, rotate(0, [1, 0, 0]));
		mat_main = mult(mat_main, translate(vec3(x, 0, z))); 
	}
	else
	{
		mat_main = mult(mat_main, rotate(cam_ver, [1, 0, 0]));
		mat_main = mult(mat_main, translate(vec3(x, y, z)))
	}
	mat_main = mult(mat_main, translate(vec3(0, 0, loc_center_zVal)));
	mat_main = mult(mat_main, rotate(time*velocity_Orb[3], [0, 1, 0])); 
	mat_main = mult(mat_main, translate(vec3(0, 0, spheres_displacement[3]))); 
	mat_main = mult(mat_main, rotate(time*velocity_Orb[5], [0, 1, 0])); 
	mat_main = mult(mat_main, translate(vec3(0, 0, 3)));
	mat_main = mult(mat_main, scale(vec3(planetScale[4], planetScale[4], planetScale[4])));
	mat_main = mult(mat_main, rotate(time*velocity_rot[1], [0, 1, 0]));
    gl.uniformMatrix4fv(Umat_main, false, flatten(mat_main));
    gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(mat_proj));

	for( var i=0; i<index; i+=3) 
        gl.drawArrays(gl.TRIANGLES, i, 3);
	
	//calling the render function again/looping
    window.requestAnimFrame(render);
}

// these 2 functions are setting the boolean values of Phong and gouraud 
function phong_frag_func() {
	gl.uniform1f(Ugouraude_ver_boolean, false);
	gl.uniform1f(Uphong_frag_boolean, true);
}
function Ugouraude_ver_fun() {
	gl.uniform1f(Ugouraude_ver_boolean, true);
	gl.uniform1f(Uphong_frag_boolean, false);
}

//   ANGEL sphere functions
// num_in_array is the number/index of the planets in the array

function draw_Sphere(num_in_array, num_vertices) {//2 is more points than 0
	if(num_vertices===2) {
		// setting buffers and binding
		gl.bindBuffer(gl.ARRAY_BUFFER, pos_C);//high
		gl.vertexAttribPointer(posAttr, 4, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, norm_C);
		gl.vertexAttribPointer(normAttr, 4, gl.FLOAT, false, 0, 0);
	}
	else if(num_vertices===1) {// low
		gl.bindBuffer(gl.ARRAY_BUFFER, pos_B);
		gl.vertexAttribPointer(posAttr, 4, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, norm_B);
		gl.vertexAttribPointer(normAttr, 4, gl.FLOAT, false, 0, 0);
	}
	else {//middle
		gl.bindBuffer(gl.ARRAY_BUFFER, pos_A);
		gl.vertexAttribPointer(posAttr, 4, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, norm_A);
		gl.vertexAttribPointer(normAttr, 4, gl.FLOAT, false, 0, 0);
	}
	// setting the light variables uniform
	gl.uniform3fv(UlightPos_vec3, flatten(lightPos_vec3));
	gl.uniform4fv(Uamb_Val, flatten(amb_Val[num_in_array]));
    gl.uniform4fv(Udiff_Val, flatten(diff_Val[num_in_array]));
    gl.uniform4fv(Uspec_Val, flatten(spec_Val[num_in_array]));
    gl.uniform1f(uniform_shininess, shininess);
	gl.uniform4fv(Uamb_Val_frag, flatten(amb_Val[num_in_array]));
    gl.uniform4fv(Udiff_Val_frag, flatten(diff_Val[num_in_array]));
    gl.uniform4fv(Uspec_Val_frag, flatten(spec_Val[num_in_array]));
    gl.uniform1f(uniform_shininess2, shininess);
	
	//putting the spheers in place, rotate, scale, translate and orbit them
	mat_main = mat_view;
	mat_main = mult(mat_main, rotate(cam_hoz, [0, 1, 0])); 
		if(attach_detach)
	{
		mat_main = mult(mat_main, rotate(0, [1, 0, 0]));
		mat_main = mult(mat_main, translate(vec3(x, 0, z))); 
	}
	else
	{
		mat_main = mult(mat_main, rotate(cam_ver, [1, 0, 0]));
		mat_main = mult(mat_main, translate(vec3(x, y, z)))
	}
	mat_main = mult(mat_main, translate(vec3(0, 0, loc_center_zVal)));
	mat_main = mult(mat_main, rotate(time*velocity_Orb[num_in_array], [0, 1, 0]));
	mat_main = mult(mat_main, translate(vec3(0, 0, spheres_displacement[num_in_array])));
	mat_main = mult(mat_main, scale(vec3(planetScale[num_in_array], planetScale[num_in_array], planetScale[num_in_array])));
	mat_main = mult(mat_main, rotate(time*velocity_rot[num_in_array], [0, 1, 0]));
    gl.uniformMatrix4fv(Umat_main, false, flatten(mat_main));
    gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(mat_proj));

	for( var i=0; i<index; i+=3) 
        gl.drawArrays(gl.TRIANGLES, i, 3);
	
}
function triangle(a, b, c, flat_smooth, norm_inverse) {//a,b,c get values va, vb, vc,
//flat_smooth is 1 for smooth and 0 for flat shadng. 
//norm_inverse is -1 of the normals
	if(flat_smooth==0) 
	{ 
		var val_3 = subtract(b, a);
		var val_4 = subtract(c, a);
		var normal = normalize(cross(val_3, val_4));
		normal = vec4(normal);
		if(norm_inverse) 
		{
			norm_Arr.push(scale1(-1,normal));
			norm_Arr.push(scale1(-1,normal));
			norm_Arr.push(scale1(-1,normal));
		}
		else 
		{
			norm_Arr.push(normal);
			norm_Arr.push(normal);
			norm_Arr.push(normal);
		}
	}
	else 
	{
		if(norm_inverse)
		{
			norm_Arr.push(scale1(-1,a));
			norm_Arr.push(scale1(-1,b));
			norm_Arr.push(scale1(-1,c));
		}
		else 
		{
			norm_Arr.push(a);
			norm_Arr.push(b);
			norm_Arr.push(c);
		}
	}
	//pushing the values into the array
	pts_Arr.push(a);
	pts_Arr.push(b);
	pts_Arr.push(c);
	// increment the index by 3
	index += 3;
}
function divideTriangle(a, b, c, count, flat_smooth, norm_inverse) {
    if ( count > 0 ) 
	{               
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);                            
        divideTriangle(a, ab, ac, count-1, flat_smooth, norm_inverse);
        divideTriangle(ab, b, bc, count-1, flat_smooth, norm_inverse);
        divideTriangle(bc, c, ac, count-1, flat_smooth, norm_inverse);
        divideTriangle(ab, bc, ac, count-1, flat_smooth, norm_inverse);
    }
    else 
	{ 
        triangle(a, b, c, flat_smooth, norm_inverse);
    }
}

function sphere(a, b, c, d, n, flat_smooth, norm_inverse) {
    divideTriangle(a, b, c, n, flat_smooth, norm_inverse);
    divideTriangle(d, c, b, n, flat_smooth, norm_inverse);
    divideTriangle(a, d, b, n, flat_smooth, norm_inverse);
    divideTriangle(a, c, d, n, flat_smooth, norm_inverse);
}




// navigation system (REQUIREMENT 6)

function motion_func(cam_ver_hoz, cam_ver_val, dir, increment) {
	// degree can be modulo-ed to less than 360 without loss of rotational data
	var mod_deg = cam_ver_val % 360;
	
	// determine if mod_deg is bool_neg
	var bool_neg = false;
	if(mod_deg<0)
		bool_neg = true;
	
	// make mod_deg positive regardless of sign
	mod_deg = Math.abs(mod_deg);
	
	// if mod_deg exceeds 180, find the difference from 360 and toggle the value of bool_neg
	if(mod_deg>180) {
		mod_deg = 360-mod_deg;
		bool_neg = !bool_neg;
	}
	if(mod_deg<-180) {
		mod_deg = 360+mod_deg;
		bool_neg = !bool_neg;
	}
	
	// convert mod_deg to radians for calculating the adjacent/opposite sides using tangent
	var radian = mod_deg*Math.PI/180;
	if(bool_neg)
		radian = -radian;
	
	yprime = increment*Math.sin(radian); // sine is odd, so sign must be flipped based on mod_deg
	var horz = Math.abs(increment*Math.cos(radian)); // cosine is even, so sign of mod_deg doesn't matter
			
	if(dir===0) // forward (i)
		yprime = -yprime;
	else if(dir===1) // backward (m)
		yprime = yprime;
	else if(dir===2) // left (j)
		yprime = 0;
	else if(dir===3) // right (k)
		yprime = 0;
		
	camera_ijkm(cam_ver_hoz, dir, horz);

}
function camera_ijkm(rdegree, dir, increment) {// angle with the z axis when x and y are zeros

	// degree can be modulo-ed to less than 360 without loss of rotational data
	mod_deg = rdegree % 360;
	// determine if mod_deg is bool_neg
	var bool_neg = false;
	if(mod_deg<0)
		bool_neg = true;
	
	// make degree positive regardless of sign
	mod_deg = Math.abs(mod_deg);
	
	if(mod_deg>180)
	{           				 // check if angle > 180
		mod_deg = 360-mod_deg;   // find difference value from 360 (by subtracting)
		bool_neg = !bool_neg; // switch the bool_neg
	}
	if(mod_deg<-180)
	{            				// check if angle < -180
		mod_deg = 360+mod_deg;     // find difference value from 360 (by adding)
		bool_neg = !bool_neg;    // switch the bool_neg
	}
	var radian = mod_deg*Math.PI/180; //change to radians 
	if(bool_neg)
		radian = -radian;
	var opposite = Math.tan(radian)*Math.sqrt(increment/(1+Math.pow(Math.tan(radian),2))); // calculating the opposite using trig functions
	var adjacent = Math.sqrt(increment/(1+Math.pow(Math.tan(radian),2))); // calculating the adjacent using trig functions
	//covering the cases of 90, 80 and all others & flipping signs in bool_neg degree and > 90 cases
	//0 is for i key
	//1 is for m key
	//2 is for j key
	//4 is for k key	
	
	if(mod_deg===180)
	{
		if(dir===0)
		{ 
			xprime = 0;
			zprime = increment;
		}
		else if(dir===1)
		{ 
			xprime = 0;
			zprime = -increment;
		}
		else if(dir===2) 
		{ 
			xprime = increment;
			zprime = 0;
		}
		else if(dir===3) 
		{ 
			xprime = -increment;
			zprime = 0;
		}
	}
	else if(mod_deg===90) 
	{		
		if(dir===0) 
		{ 
			xprime = increment;
			zprime = 0;
		}
		else if(dir===1) 
		{ 
			xprime = -increment;
			zprime = 0;
		}
		else if(dir===2) 
		{ 
			xprime = 0;
			zprime = -increment;
		}
		else if(dir===3) 
		{ 
			xprime = 0;
			zprime = increment;
		}
		if(bool_neg) 
		{
			xprime = -xprime;
			zprime = -zprime;
		}
	}
	else {
		if(dir===0) 
		{
			xprime = opposite;
			zprime = -adjacent;
		}
		else if(dir===1) 
		{ 
			xprime = -opposite;
			zprime = adjacent;
		}
		else if(dir===2) 
		{ 
			xprime = -adjacent;
			zprime = -opposite;
		}
		else if(dir===3) 
		{ 
			xprime = adjacent;
			zprime = opposite;
		}
	}
	if(mod_deg>90) 
	{
		xprime = -xprime;
		zprime = -zprime;
	}
}
