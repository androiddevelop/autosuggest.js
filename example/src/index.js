import React from "react";
import ReactDOM from "react-dom";
import 'bootstrap-autosuggest/dist/autosuggest.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from "jquery";
import 'bootstrap-autosuggest';

class AutoSuggest extends React.Component {
    componentDidMount() {
        $("#t1").autosuggest({
            url: 'city.php',
            minLength: 1,
            maxNum: 5,
            align: 'left',
            method: 'get',
            queryParamName: 'city',
            split: ' ',
            highlight: true,
            dataCallback: function (data) {
                let arr = [];
                for (let item of data) {
                    item.label = '>>' + item.value;
                    arr.push(item);
                }
                return arr;
            }
        });

        $("#t2").autosuggest({
            url: 'city.php',
            method: 'get',
            queryParamName: 'city'
        });

    }

    render() {
        return (
            <div style={{'paddingTop': '60px', paddingLeft: '30px', paddingRight: '30px'}}>
                <div className="form-group col-md-12 col-xs-12">
                    <input className="form-control" id="t1" placeholder="最短提示长度为1, 最多联想5个, 空格分割, 请输入中国省份，例如'浙江'"
                    />
                </div>
                <div className="form-group col-md-12 col-xs-12"
                     style={{'paddingTop': '60px'}}>
                    <input className="form-control" id="t2" placeholder="默认操作，最短提示长度为2"
                    />
                </div>
            </div>
        );
    }
}

function App() {
    return (<div><AutoSuggest/></div>);
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);