import { Page, Button, TextView, ImageView, TextInput, ActivityIndicator, Widget } from 'tabris';

const KEY = "Plus-Card";
const MAX = 30;

export default class MainPage extends Page {

  state: number
  input: TextInput

  constructor() {
    super({
      topLevel: true,
      title: 'MESA Plus Card',
      background: 'rgb(9, 120, 191)'
    });

    this.state = 0;
    this.createUI();
  }

  private displayCode() {
  	this.state = 3;
  	let code = localStorage.getItem(KEY);

    if (code.length > MAX) {
      code = code.substring(0, MAX - 3) + "...";
    }

  	this.disposeState();

    this.animateIn(new TextView({
      id: 'code',
      text: code,
      textColor: 'white',
      font: 'bold 24px',
      opacity: 0,
      centerX: 0, top: ['prev()', 0],
    }));

    this.animateIn(new Button({
      id: 'logout',
      text: 'Log Out',
      textColor: 'white',
      background: 'black',
      opacity: 0,
      centerX: 0, top: ['prev()', 20],
    }).on('select', () => this.showLoginScreen()), 0.7);
  }

  private createUI() {
  	let tapEvent = () => {
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
      centerX: 0, top: ['prev()', 0],
      opacity: 0,
      width: 300,
      textColor: 'white',
      font: '24px'
    });

    this.animateIn(this.input);

    this.input.on('accept', () => this.login());

    this.animateIn(new Button({
      id: 'login',
      text: 'Log In',
      opacity: 0,
      textColor: 'white',
      background: 'black',
      centerX: 0, top: ['prev()', 20],
    }).on('select', () => this.login()), 0.7);
  }

  private animateIn(ob: Widget, last = 1) {
    ob.appendTo(this);

    ob.animate({
      opacity: last,
    }, {
      delay: 100,
      duration: 800,
      easing: 'ease-in'
    });
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
  	this.children("#activity").dispose();
	  this.children("#input").dispose();
  	if (this.input) {
  		this.input = null;
  	}
  	this.children("#login").dispose();
  	this.children("#error").dispose();
	  this.children("#logout").dispose();
	  this.children("#code").dispose();
  }

  private login() {
  	let email = "";

  	if (this.input) {
  		email = this.input.get("text");
  	}

  	if (!email) {
  		this.showError("Please enter a valid e-mail.");
  		return;
  	}

  	this.state = 2;

  	this.disposeState();

  	new ActivityIndicator({id: 'activity', centerX: 0, centerY: 0}).appendTo(this);

	fetch("http://192.168.0.119:8080/package.json")
	.then(response => response.json())
  .then(json => {
    console.log("success " + json);
    localStorage.setItem(KEY, JSON.stringify(json));

    this.displayCode();
  }).catch(err => {
    console.log("fail " + err);
	  // On error show want went wrong and reload button.
	  this.showLoginScreen();
	  this.showError("Failure: " + (err || "Error loading data"));
	});
  }

}
