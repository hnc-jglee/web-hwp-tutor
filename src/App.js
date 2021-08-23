import logo from './logo.svg';
import './App.css';
import Iframe from 'react-iframe';

function App() {
  return (
    <div className="menu-bar">
      <p>WebHwp Tutor</p>
      <div className="app-workspace">
        <div className="app-workspace-item">
          <Iframe url="http://webhw-webid-1m5mfhjm0oi2w-560475011.ap-northeast-2.elb.amazonaws.com/#/home/project" width="100%" height="100%" />
        </div>
        <div className="app-workspace-item">
          <Iframe url="http://webhw-webhw-nqgw1bnwi4e8-1170506925.ap-northeast-2.elb.amazonaws.com/webhwpctrl" width="100%" height="100%" />
        </div>
      </div>
    </div>
  );
}

export default App;
