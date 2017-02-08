import { Page, Button, TextView, ImageView, TextInput, ActivityIndicator, Widget } from 'tabris';

const KEY = "MESAPLUS";
const MAX = 30;

export default class MainPage extends Page {

  state: number
  input: TextInput

  constructor() {
    super({
      topLevel: true,
      title: 'MESA Plus',
      icon: {src: './images/logo.png'},
      background: 'rgb(255, 255, 255)'
    });
    this.state = 0;
    this.createUI();
  }

  private displayCode() {
  	this.state = 3;
    let code = JSON.parse(localStorage.getItem(KEY));
    if (!code.found) {
      return this.showLoginScreen();
    }

    let name = "Welcome, " + code.first + " " + code.last + ".";
    let clubs = "You are registered as:\nMESA Member";
    for (let club of code.clubs) {
      clubs += "\n" + club + " Member";
    }

  	this.disposeState();

    this.animateIn(new TextView({
      id: 'name',
      text: name,
      textColor: 'black',
      font: 'bold 12px',
      opacity: 0,
      centerX: 0, top: ['#image', 0],
    }));

    this.animateIn(new TextView({
      id: 'clubs',
      text: clubs,
      textColor: 'black',
      font: 'bold 12px',
      opacity: 0,
      centerX: 0, top: ['#name', 0],
    }));

    this.animateIn(new Button({
      id: 'logout',
      text: 'Log Out',
      textColor: 'white',
      background: 'black',
      opacity: 0,
      centerX: 0, top: ['#clubs', 20],
    }).on('select', () => this.showLoginScreen()), 0.7);
  }

  private createUI() {
  	let tapEvent = () => {
      console.log("tap" + this.state);
      if (this.state === 0) {
        if (localStorage.getItem(KEY)) {
          this.displayCode();
        } else {
      	  this.showLoginScreen();
        }
      }
    };

    let image = new ImageView({
      image: {src: './images/logo.png'},
      scaleMode: 'auto',
      opacity: 0,
      top: 0,
      id: 'image'
    });

    image.on('tap', tapEvent).appendTo(this);

    image.animate({
      opacity: 1,
      transform: {
        translationY: 20,
        scaleX: 1.05,
        scaleY: 1.05
      }
    }, {
      delay: 200,
      duration: 1600,
      easing: 'ease-in',
      name: 'appear'
    }).then(tapEvent);
  }

  private showLoginScreen() {
  	if (this.state === 1) {
  	  return;
  	}
    localStorage.clear();
  	this.state = 1;

	  this.disposeState();

    this.input = new TextInput({
      id: 'input',
      message: 'E-mail',
      keyboard: 'email', // number decimal ascii numbersAndPunctuation url phone
      centerX: 0, top: ['#image', 0],
      opacity: 0,
      width: 300,
      textColor: 'black',
      font: '24px'
    });

    this.animateIn(this.input);

    this.input.on('accept', () => this.login());

    this.animateIn(new Button({
      id: 'login',
      text: 'Log In',
      opacity: 0,
      textColor: 'black',
      background: 'white',
      centerX: 0, top: ['#input', 20],
    }).on('select', () => this.login()), 0.7);
  }

  private animateIn(ob: Widget, last = 1) {
    console.log("anim " + ob);
    ob.appendTo(this).animate({
      opacity: last,
    }, {
      delay: 100,
      duration: 800,
      easing: 'ease-in'
    });

    return ob;
  }

  private showError(err: string) {
	  this.children("#error").dispose();

    new TextView({
      id: 'error',
      text: err,
      textColor: 'red',
      centerX: 0, top: ['prev()', 20],
    }).appendTo(this);
  }

  private disposeState() {
    console.log("dispose" + this.state);
  	this.children("#activity").dispose();
	  this.children("#input").dispose();
  	if (this.input) {
  		this.input = null;
  	}
  	this.children("#login").dispose();
  	this.children("#error").dispose();
	  this.children("#logout").dispose();
    this.children("#name").dispose();
    this.children("#clubs").dispose();
	  this.children("#code").dispose();
  }

  private login() {
    console.log('log in');
  	let email = "";
    let origEmail = "";

  	if (this.input) {
      origEmail = this.input.get("text");
      email = origEmail.toLowerCase().replace(/\./g, "");
  	}

  	if (!email) {
  		this.showError("Please enter a valid e-mail.");
  		return;
  	}
    console.log("Send " + email);

  	this.state = 2;

  	this.disposeState();

  	new ActivityIndicator({id: 'activity', centerX: 0, centerY: 0}).appendTo(this);

    fetch("http://api.mesa.ca/v1/auth.php?email=" + email)
    .then(response => response.json())
    .then(json => {
      console.log("success " + json);
      json.email = origEmail;

      if (json.found) {
        localStorage.setItem(KEY, JSON.stringify(json));

        this.displayCode();
      } else {
        this.showLoginScreen();
        this.showError("E-mail not found.");
      }
    }).catch(err => {
      console.log("fail " + err);
      // On error show want went wrong and reload button.
      this.showLoginScreen();
      this.showError("Failure: " + (err || "Error loading data"));
    });
  }

}
