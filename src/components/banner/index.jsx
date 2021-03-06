import React, {Component} from 'react';
import styles from './style.less';
import logo from './logo.png';
import star from './star.png';

export default class index extends Component {
    state = {
        isMount: false,
    };

    componentDidMount() {
        this.setState({isMount: true});
    }


    render() {
        const {isMount} = this.state;

        return (
            <div className={isMount ? `${styles['root']} ${styles['active']}` : `${styles['root']}}`}>
                <div className={styles.star}>
                    <img src={star} alt="星星"/>
                </div>
                <div className={styles.logo}>
                    <img src={logo} alt="图标"/>
                    <span>中山大学</span>
                </div>
            </div>
        );
    }
}
