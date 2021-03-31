import React from 'react'
import PropTypes from 'prop-types'
import { Descriptions, Space, Typography } from 'antd'
import _ from 'lodash'

/*
Example:
<ObjectTable data={[
    {label: 'Label1', value: 'Value1'},
    {label: <><Icon1>Label2</>, value: <><Icon2>Value2</>},
    {label: 'Label3', value: 'Value2', copyable: false},
]}
/>

<ObjectTable copyable={false} data={[
    {label: 'Label1', value: 'Value1', copyable: true},
    {label: <><Icon1>Label2</>, value: <><Icon2>Value2</>},
    {label: 'Label3', value: 'Value2'},
]}
/>

<ObjectTable data={[
    {label: 'Label1', value: ['Value1', 'Value2]},
    {label: 'Label3', value: 'Value2'},
]}
/>
*/

/**
 * @augments {React.Component<Props, State>}
 */
export default class ObjectTable extends React.Component {
    render() {
        // copyable comes from the component level and can be overwritten at the item level
        var defaultCopyable = _.defaultTo(this.props.copyable, true)
        var defaultSeparaotr = _.defaultTo(this.props.separator, true)
        var data = this.props.data.map(item => {
            // can be overwritten by data item
            var copyable = _.defaultTo(item.copyable, defaultCopyable)
            if (copyable) {
                copyable = {
                    tooltips: false
                }
            }
            var separator = _.defaultTo(item.separator, defaultSeparaotr)
            var descItem;
            if (React.isValidElement(item.value)) {
                descItem = item.value
            } else {
                // if value is array, separate them out
                var descItem = []
                if (Array.isArray(item.value)) {
                    item.value.forEach((v, idx) => {
                        if (idx !== 0) {
                            descItem.push(<span key={'__slash' + idx}>{separator}</span>)
                        }
                        descItem.push(<Typography.Text copyable={copyable} key={idx}>{v}</Typography.Text>)
                    })
                    descItem = <Space size="small">{descItem}</Space>
                } else {
                    descItem = <Typography.Text copyable={copyable}>{item.value}</Typography.Text>
                }
            }
            return <Descriptions.Item label={item.label} key={item.label}>
                {descItem}
            </Descriptions.Item>
        })
        return <Descriptions size="small" bordered column={1} className="object-table"
            labelStyle={{ fontWeight: "bold" }}
            contentStyle={{ backgroundColor: "white" }}>
            {data}
        </Descriptions>
    }
}

ObjectTable.defaultProps = {
    copyable: true,
    separator: '/',
}

ObjectTable.propTypes = {
    /** make the value copyable or not, defaults true. Can be overridden at each item of the data level */
    copyable: PropTypes.bool,

    /** separator for multivalues. default slash (/). Can be overridden at each item of the data level */
    separator: PropTypes.string,

    /** list of objects to show in the descriptions table. each item is of the form
     * {'label': 'Label Value', 'value': 'Value of the item' / ReactNode, copyable: true/false, defaults to props.copyable}
    */
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.node,
            value: PropTypes.node,
            copyable: PropTypes.bool,
            separator: PropTypes.string,
        })
    )
}