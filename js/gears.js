var Gear = function(){
  this.teeth = 14 ; // number of teeth (typically the only parameter to change)
//this. note: rest of parameters must be unchanged if you want gears to fit.
  this.mm_per_tooth = 9*2*pi; // pixel size of one gear tooth (even though it says millimeters, it's pixels) must be same for two gears to fit each other
  this.pressure_angle= 20; // in degrees, determines gear shape, range is 10 to 40 degrees, most common is 20 degrees
  this.clearance=4; // freedom between two gear centers
  this.backlash=4; // freedom between two gear contact points
  this.axle_radius=20; // center hole radius in pixels

  this.pressure_angle = degrees_to_radians ( this.pressure_angle); // convet degrees to radians

  this.svg = null;
}

Gear.prototype.render = function(draw){
  if(this.svg){ this.svg.remove(); }
  this.svg = draw.group().attr('class', 'gear')

  this.svg.polygon(this.buildToString())
    .fill('#f06')
    .stroke('#000');

  this.svg.circle( this.axle_radius*2 )
    .fill('#fff')
    .stroke('#000')
    .transform({
      x : -this.axle_radius,
      y : -this.axle_radius
    })

  this.svg.transform({
    x : window.draw.node.clientWidth/2,
    y : window.draw.node.clientHeight/2,
  })

}

Gear.prototype.build = function(){
  this.number_of_teeth = this.teeth;
  p  = this.mm_per_tooth * this.number_of_teeth / pi / 2;  // radius of pitch circle
  c  = p + this.mm_per_tooth / pi - this.clearance;        // radius of outer circle
  b  = p * Math.cos(this.pressure_angle);             // radius of base circle
  r  = p-(c-p)-this.clearance;                        // radius of root circle
  t  = this.mm_per_tooth / 2-this.backlash / 2;            // tooth thickness at pitch circle
  k  = -iang(b, p) - t/2/p;                      // angle where involute meets base circle on side of tooth
  
// here is the magic - a set of [x,y] points to create a single gear tooth
  
  points=[ polar(r, -3.142/this.number_of_teeth), polar(r, r<b ? k : -pi/this.number_of_teeth),
          q7(0/5,r,b,c,k, 1), q7(1/5,r,b,c,k, 1), q7(2/5,r,b,c,k, 1), q7(3/5,r,b,c,k, 1), q7(4/5,r,b,c,k, 1), q7(5/5,r,b,c,k, 1),
          q7(5/5,r,b,c,k,-1), q7(4/5,r,b,c,k,-1), q7(3/5,r,b,c,k,-1), q7(2/5,r,b,c,k,-1), q7(1/5,r,b,c,k,-1), q7(0/5,r,b,c,k,-1),
          polar(r, r<b ? -k : pi/this.number_of_teeth), polar(r, 3.142/this.number_of_teeth) ];

  var answer = [];
  
  // create every gear tooth by rotating the first tooth
  
  for (var i=0; i<this.number_of_teeth; i++ ) answer = answer.concat (  rotate( points, -i*2*pi/this.number_of_teeth ) );
  
  return answer; // returns an array of [x,y] points
  
}

Gear.prototype.buildToString = function(){
  var points = this.build();
  var string = "";
  for(var n=0; n<points.length; n++){
    string += points[n][0]+","+points[n][1]+" ";
  }
  return string;
}

Gear.prototype.Save_SVG = function(){
  var blob = new Blob([window.draw.exportSvg({ whitespace: true })], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "gear.svg");
}

// UTILS

// Adapted from http://jsbin.com/AKiFEPI/1/edit
// Adapted from: Public Domain Parametric Involute Spur Gear by Leemon Baird, 2011, Leemon@Leemon.com http://www.thingiverse.com/thing:5505
// see also http://grabcad.com/questions/tutorial-how-to-model-involute-gears-in-solidworks-and-show-design-intent

pi=Math.PI;

// degrees to radians

function degrees_to_radians(theta) { return theta/180*pi; }

// polar to cartesian 

function polar(r,theta) { return [r*Math.sin(theta), r*Math.cos(theta)]; }

// point on involute curve

function q6(b,s,t,d) { return polar(d,s*(iang(b,d)+t)); }             

// unwind this many degrees to go from r1 to r2

function iang(r1,r2) { return Math.sqrt((r2/r1)*(r2/r1) - 1) - Math.acos(r1/r2); }

// radius a fraction f up the curved side of the tooth 

function q7(f,r,b,r2,t,s) { return q6(b,s,t,(1-f)*Math.max(b,r)+f*r2); }

// rotate an array of 2d points

function rotate ( points_array, angle ) {    
   var answer =[];
   for(var i=0; i<points_array.length; i++) {
      x=points_array[i][0]; 
      y=points_array[i][1];
      xr = x * Math.cos (angle) - y * Math.sin (angle);
      yr = y * Math.cos (angle) + x * Math.sin (angle);
      answer.push( [xr,yr] );
   }
  return answer;
}
