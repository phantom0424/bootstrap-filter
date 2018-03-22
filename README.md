## 下拉框插件
> 本插件基于bootstrap-select进行二次封装的，可以支持远程搜索，bootstrap-select所有的配置都可支持，可以参考https://developer.snapappointments.com/bootstrap-select/

### 依赖项
~~~
<link href="https://cdn.bootcss.com/bootstrap-select/1.12.4/css/bootstrap-select.min.css" rel="stylesheet">
<script src="https://cdn.bootcss.com/bootstrap-select/1.12.4/js/bootstrap-select.min.js"></script>
<script src="https://cdn.bootcss.com/bootstrap-select/1.12.4/js/i18n/defaults-zh_CN.js"></script>
~~~

### 使用
* 页面引用
~~~
<script src="dist/bootstrap-filter.js"></script>
~~~

* 使用控件
~~~
// 初始化控件
$('#selGrade').bsfilter({
    url: url,
    valueField: 'ui_grade_id',
    textField: 'v_grade_name'
});

// 带分组的
$('#selClass').bsfilter({
    url: url,
    valueField: 'ui_class_id',
    textField: 'v_class_name',
    groupField: 'v_group_name'
});
~~~

~~~
// 设置值
$("#selGrade").bsfilter('setValue', 1000041020111);
~~~

~~~
// 选中第一个选项
$("#selGrade").bsfilter('selectFirst');
~~~

~~~
// 重新加载数据
$("#selClass").bsfilter('reload', {
    queryParams: {
        ui_grade_id: 1000041020111
    }
});
~~~

### 配置

|  名称  |  HTML属性  |  类型  |  默认值  |  说明  |
|   --   |     --     |   --   |    --    |   --   |
| data | - | [] | [] | 要加载的数据 |
| notEmpty | data-not-empty | boolean | false | 是否不要空选项 |
| url | data-url | string | '' | 远程数据连接 |
| queryParams | - | {} | {} | 查询参数 |
| value | data-value | string | '' | 默认值 |
| valueField | data-value-field | string | '' | 值字段 |
| textField | data-text-field | string | '' | 显示字段 |
| groupField | data-group-field | string | '' | 分组字段 |
| emptyValue | data-empty-value | string | '' | 空选项的值 |
| emptyText | data-empty-text | string | '' | 空选项的显示文字 |

### 函数
|  名称  | 参数 | 说明 |
| -- | -- | -- |
| getOptions |  | 获取参数 |
| getData | - | 获取数据 |
| destroy | - | 摧毁控件 |
| refresh | - | 刷新控件 |
| refreshOptions  | - | 刷新参数 |
| reload | options | 重新加载数据 |
| search | value | 远程搜索 |
| setValue | value | 设置值 |
| selectFirst | opts | 选中第一个选项 |

### 事件
| 配置中事件 | jquery中事件 | 参数 | 说明 |
| -- | -- | -- | -- |
| onAll | all.bs.seat |  name, args  | 所有事件均会触发该事件 |
| onRefresh | refresh.bs.seat   | - | 刷新事件 |
| onRefreshOptions | refresh-options.bs.seat | opts | 刷新配置事件 |
| onDestroy | destroy.bs.seat | - | 销毁事件 |
| onLoadSuccess | load-success.bs.seat | data, textStatus, e | 远程加载成功事件 |
| onRendered | rendered.bs.seat | - | 插件渲染完成事件 |
| onChange | change | - | 下拉框变化事件 |
| onInited | inited.bs.seat | - | 插件初始化完成事件 |