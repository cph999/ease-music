import logo from './logo.svg';
import './App.css';
import PlayList from './components/PlayList.tsx';
import 'react-vant/es/styles';
import MusicPlayer from './components/MusicPlayer.tsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <MusicPlayer name={"Rubia"} />
        <PlayList />
      </header>
    </div>
  );
}

export default App;
