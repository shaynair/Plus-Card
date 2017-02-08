import { ui } from 'tabris';
import MainPage from './MainPage';

ui.set({
  background: 'rgb(255, 255, 255)',
  textColor: 'white',
  statusBarTheme: 'dark'
});

new MainPage().open();
