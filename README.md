# autosuggest.js

适用于Bootstrap的Ajax输入建议控件([Demo](https://example.codeboy.me/autosuggest/index.html))

在[bootcomplete.js](https://github.com/getwebhelp/bootcomplete.js)的基础上大幅度改进，改动如下:

1. **文本框是去焦点时自动隐藏输入提示组件**
2. **增加最大建议数目限制(maxNum)**
3. **增加键盘方向键选择**
4. **增加文本对齐选择(align)**
5. **增加回车触发函数(nextStep)**
6. **增加以分隔符分割的联想(split)**
7. **增加匹配高亮(highlight)**

### 依赖

- [jQuery](https://jquery.com/download/)(>=1.0)
- [Bootstrap](http://getbootstrap.com/getting-started/)(>=3.0)


### 基本使用

	$('#input').autosuggest({url:'/search.php'});
	
### json数据格式(必须)

	[ 
	  {
       "id" : someId, 
       "label" : "some label name"
      }
	]


> 如果服务端返回数据非此种格式，请修改。


### 参数

#### url: 

提交请求地址, 可以是json文件，注意跨域问题

#### method(非必须):

请求方式(`get`, `post`), 默认`get`

#### queryParamName(非必须):

传递当前输入框的值时的参数名称,默认 `query`,即如果是get方式并保持该值为默认值,则请求url为 `xxx.com?query=input_value` ,如果设置此值为 `search` ,则url为 `xxx.com?search=input_value`
 
#### align(非必须):
对齐方式,默认左对齐,可选项 `left` , `center` , `right`

#### wrapperClass(非必须):

包围输入框外层div的css样式

#### menuClass(非必须):

自动补全菜单的css样式，如果需要自定义请提供

#### minLength(非必须):

发起请求的最小长度，只有>= 此长度时才会出现建议框,默认最小长度为 `2`

#### maxNum(非必须):

最大建议数目,默认最多给出 `10` 个建议提示

#### highlight(非必须):

是否高亮显示匹配内容, 默认 `false`

#### split(非必须):
分隔符, 例如我们需要文本框中输入多个省份,使用逗号分开,那么我们可以设定 `split` 为 `,` , 之后 `autosuggest.js` 会根据最后一个逗号后面的内容进行建议.  默认为 `null` ，即把文本框中所有输入视为一个文本进行建议.

#### open(非必须):

建议框由隐藏状态变为可见状态时的回调,默认null

#### close(非必须):

建议框由可见状态变为隐藏状态时的回调,默认null

#### nextStep(非必须):

选中建议词后,建议框消失,之后点击回车要执行的函数。

#### immediate(非必须)

是否鼠标选中后或者键盘选中回车后立刻执行nextStep操作,默认 `false`

#### extra(非必须): 

除了queryParam之外的其他参数. 使用: 

	 "key1" : "value1",
	 "key2" : "value2"
	   
### 例子

    //简单实例
    $("#test").autosuggest({
        url: 'city.json',
        queryParamName: 'search'
    });
    
    //复杂实例
    $("#test").autosuggest({
        url: 'city.json',
        minLength: 1,
        maxNum: 3,
        align: 'center',
        queryParamName: 'search'
        method: 'post',
        highlight: true,
        queryParamName: 'search',
        extra: {
            "key1": "value1",
            "key2": "value2"
        },
        nextStep: function () {
            alert("test");
        },
        split: ' ',
        open: function(){
            console.log("start open");
        },
        close: function(){
            console.log("start close");
        }
    });


有任何问题,欢迎发送邮件到[app@codeboy.me](mailto:app@codeboy.me)交流