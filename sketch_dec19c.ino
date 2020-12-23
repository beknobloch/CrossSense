int inputPin1 = 3; 
int inputPin2 = 4; // choose the input pin (for PIR sensor)
int pirState = LOW;             // we start, assuming no motion detected
int val1 = 0;
int val2 = 0;// variable for reading the pin status
 
void setup() {
  Serial.begin(38400);
  pinMode(inputPin1, INPUT);
  pinMode(inputPin2, INPUT);// declare sensor as input
}
 
void loop(){
  val1 = digitalRead(inputPin1);
  val2 = digitalRead(inputPin2);  // read input value
  if (val1 == HIGH || val2 == HIGH) {            // check if the input is HIGH
    if (pirState == LOW) {
      // we have just turned on
      Serial.println("Motion detected!");
      // We only want to print on the output change, not state
      pirState = HIGH;
    }
  } else {
    if (pirState == HIGH){
      // we have just turned of
      Serial.println("Motion ended!");
      // We only want to print on the output change, not state
      pirState = LOW;
    }
  }
}
