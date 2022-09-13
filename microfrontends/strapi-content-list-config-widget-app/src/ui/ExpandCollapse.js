import React from "react";

class ExpandCollapse extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            values: {
                name: ''
            }
        };
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.runOnFilterData(this.state.values.name);
    };

    handleInputChange = (event) => {
        this.setState({
            values: { [event.target.name]: event.target.value },
        });
    };

    onClick = () => {
        this.setState({ open: !this.state.open })
    }

    handleKeyDown() {

    }

    render() {
        return (
            <div
                className="lcw-ContentsFilter well ec-main"
                role="button"
                tabIndex={0}
            >
                <form onSubmit={this.handleSubmit}>
                    <div className="ec-form">
                        <button id="dropdown-example" role="button" aria-haspopup="true" aria-expanded="false" type="button" className="dropdown-toggle btn btn-default">Name <span className="caret"></span></button>
                        <input
                            type="search"
                            name="name"
                            value={this.state.values.name}
                            onChange={this.handleInputChange}
                            role="combobox"
                            className="rbt-input-main form-control rbt-input"
                            placeholder="Search Content"
                        />
                    </div>
                    <div className="pull-right mbt10 ec-search-btn">
                        <button className="btn btn-primary">Search</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default ExpandCollapse;