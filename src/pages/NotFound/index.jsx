import React, {Component} from 'react';
import {Button} from 'antd';
import styles from './style.less';

export default class Error extends Component {
    state = {
        time: 9,
    };

    handleGoBack = () => {
        this.props.history.goBack();
    };

    componentDidMount() {
        this.bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        if (this.props.history.length >= 2) {
            this.sI = setInterval(() => {
                const time = this.state.time - 1;

                if (time === 0) this.handleGoBack();

                this.setState({time});
            }, 1000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.sI);
        document.body.style.overflow = this.bodyOverflow;
    }

    render() {
        const {history} = this.props;
        const {time} = this.state;
        return (
            <div className={styles["root"]}>
                <div className={styles["left"]}/>
                <div className={styles["right"]}>
                    <div className={styles["right-inner"]}>
                        <div className={styles["code"]}>404</div>
                        <div className={styles["message"]}>页面不存在</div>
                        <div className={styles["buttons"]}>
                            {history.length >= 2 ? <Button type="primary" onClick={this.handleGoBack}>返回上一步（{time})</Button> : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
