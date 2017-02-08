import { Page, Button, TextView, ImageView, TextInput, ActivityIndicator, Widget, ScrollView } from 'tabris';

const KEY = "MESAPLUS";
const MAX = 30;

export default class MainPage extends Page {

  state: number
  input: TextInput
  view: ScrollView

  constructor() {
    super({
      topLevel: true,
      title: 'MESA Plus',
      background: 'rgb(255, 255, 255)'
    });
    this.state = 0;
    this.createUI();
  }

  private displayCode() {
  	this.state = 3;
    let code = JSON.parse(localStorage.getItem(KEY));
    if (!code.found || !code.id) {
      return this.showLoginScreen();
    }

    let name = "Cardholder: " + code.first + " " + code.last;
    let clubs = "Currently registered as:\n\nMESA Member";
    for (let club of code.clubs) {
      clubs += "\n" + club + " Member";
    }
    let card = "MESA Plus Card ID: " + code.id;

  	this.disposeState();

    this.animateIn(new TextView({
      id: 'name',
      text: name,
      textColor: 'black',
      font: 'bold 24px',
      opacity: 0,
      centerX: 0, top: ['#image', 10],
    }));

    this.animateIn(new TextView({
      id: 'card',
      text: card,
      textColor: 'black',
      font: 'bold 24px',
      opacity: 0,
      centerX: 0, top: ['#name', 20],
    }));

    this.animateIn(new TextView({
      id: 'clubs',
      text: clubs,
      textColor: 'black',
      font: '16px',
      opacity: 0,
      centerX: 0, top: ['#card', 20],
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
    this.view = new ScrollView({
      left: 0, right: 0, top: 0, bottom: 0 
    }).appendTo(this);

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
      height: screen.height / 4,
      opacity: 0,
      centerX: 0, top: 0,
      id: 'image'
    });

    image.on('tap', tapEvent).appendTo(this.view);

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

    this.animateIn(new TextView({
      id: 'title',
      text: 'MESA Plus Card',
      textColor: 'black',
      font: 'bold 24px',
      opacity: 0,
      centerX: 0, top: ['#image', 20],
    }));

    this.input = new TextInput({
      id: 'input',
      message: 'E-mail',
      keyboard: 'email', // number decimal ascii numbersAndPunctuation url phone
      centerX: 0, top: ['#title', 30],
      opacity: 0,
      width: Math.min(300, screen.width - 50),
      textColor: 'black',
      font: '12px'
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
    ob.appendTo(this.view).animate({
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
    }).appendTo(this.view);
  }

  private disposeState() {
  	this.view.children("#activity").dispose();
	  this.view.children("#input").dispose();
    this.view.children("#title").dispose();
  	if (this.input) {
  		this.input = null;
  	}
  	this.view.children("#login").dispose();
  	this.view.children("#error").dispose();
	  this.view.children("#logout").dispose();
    this.view.children("#name").dispose();
    this.view.children("#clubs").dispose();
    this.view.children("#card").dispose();
	  this.view.children("#code").dispose();
  }

  private login() {
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

  	this.state = 2;

  	this.disposeState();

  	new ActivityIndicator({id: 'activity', centerX: 0, centerY: 0}).appendTo(this);

    fetch("http://api.mesa.ca/v1/auth.php?email=" + email)
    .then(response => response.json())
    .then(json => {
      json.email = origEmail;

      if (json.found) {
        localStorage.setItem(KEY, JSON.stringify(json));

        this.displayCode();
      } else {
        this.view.children("#activity").dispose();
        this.showError("E-mail not found.");
      }
    }).catch(err => {
      // On error show want went wrong and reload button.
      this.view.children("#activity").dispose();
      this.showError("Failure: " + (err || "Error loading data"));
    });
  }

}
