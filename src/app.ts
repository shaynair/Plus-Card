import { ui } from 'tabris';
import MainPage from './MainPage';

ui.set({
  background: 'rgb(0, 0, 0)',
  textColor: 'white',
  statusBarTheme: 'dark'
});

new MainPage().open();
