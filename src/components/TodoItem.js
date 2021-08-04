import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class TodoItem extends Component {
    getStyle = () => {
        return {
            background: '#F4F4F4',
            padding: '10px',
            borderBottom: '1px #ccc dotted',
            textDecoration: this.props.todo.content.state === "completed" ? 'line-through' : 'none',
        }
    };

    render() {
        const todo = this.props.todo;
        return (
            <div style={ this.getStyle() }>
                <p>
                    <input type="checkbox" onChange={ this.props.toggleComplete.bind(this, todo ) } checked={ todo.content.state === "completed" ? 'checked': '' }/>{' '}
                    {todo.content.title}
                    <button onClick={this.props.delTodo.bind(this, todo)} style={{ float: 'right' }}>
                        <div className="fa fa-trash" aria-hidden="true"></div>
                    </button>
                </p>
            </div>
        )
    }
}

// PropTypes
TodoItem.propTypes = {
    todo: PropTypes.object.isRequired,
    toggleComplete: PropTypes.func.isRequired,
    delTodo: PropTypes.func.isRequired
}


export default TodoItem;