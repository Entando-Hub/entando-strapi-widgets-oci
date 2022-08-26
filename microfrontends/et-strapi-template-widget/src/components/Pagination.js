import React, { Component } from 'react'

export default class Pagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startingItem: 1,
            endingItem: 0,
            numberOfItemsPerPage: 6,
            totalItem: 21,
            currentPage: 1,
            numberOfPages: 0,
        };
    }

    componentDidMount() {
        this.setState({
            endingItem: this.state.numberOfItemsPerPage,
            numberOfPages: Math.ceil(this.state.totalItem / this.state.numberOfItemsPerPage)
        })
    }

    firstPageHandler = () => {
        this.setState({ startingItem: 1, endingItem: this.state.numberOfItemsPerPage, currentPage: 1 }, () => {
            // todo api call
            console.log("page pageSize", this.state.currentPage, this.state.numberOfItemsPerPage);
        });
    }

    previousPageHandler = () => {
        if (this.state.currentPage > 1) {
            this.setState({ currentPage: this.state.currentPage - 1 }, () => {
                this.setState({ startingItem: (this.state.currentPage - 1) * this.state.numberOfItemsPerPage + 1 })
                this.state.currentPage === this.state.numberOfPages ?
                    this.setState({ endingItem: this.state.currentPage * this.state.numberOfItemsPerPage - this.state.numberOfItemsPerPage }) :
                    this.setState({ endingItem: this.state.currentPage * this.state.numberOfItemsPerPage })
                // todo api call
                console.log("page pageSize", this.state.currentPage, this.state.numberOfItemsPerPage);

            })
        }
    }

    lastPageHandler = () => {
        this.setState({
            startingItem: this.state.numberOfPages * this.state.numberOfItemsPerPage - this.state.numberOfItemsPerPage + 1,
            endingItem: this.state.totalItem,
            currentPage: this.state.numberOfPages
        }, () => {
            // todo api call
            console.log("page pageSize", this.state.currentPage, this.state.numberOfItemsPerPage);
        });
    }

    nextPageHandler = () => {
        if (this.state.numberOfPages > this.state.currentPage) {
            this.setState({ currentPage: this.state.currentPage + 1 }, () => {
                this.state.currentPage === this.state.numberOfPages ?
                    this.setState({ endingItem: this.state.totalItem }) :
                    this.setState({ endingItem: this.state.currentPage * this.state.numberOfItemsPerPage });
                // todo api call
                console.log("page pageSize", this.state.currentPage, this.state.numberOfItemsPerPage);
            });
            this.setState({ startingItem: this.state.currentPage * this.state.numberOfItemsPerPage + 1 });

        }
    }

    inputPageNumberHandler = (event) => {
        this.setState({ currentPage: event.target.value })
    }

    onSubmitHandler = (event) => {
        event.preventDefault()
        if (!new RegExp(/^[0-9]*$/g).test(this.state.currentPage) || this.state.currentPage <= 0 || this.state.currentPage > this.state.numberOfPages) return;
        if (+this.state.currentPage === this.state.numberOfPages) {
            this.setState({ endingItem: this.state.totalItem });
        } else {
            this.setState({ endingItem: (this.state.numberOfItemsPerPage * this.state.currentPage) })
        }
        this.setState({ startingItem: this.state.numberOfItemsPerPage * (this.state.currentPage - 1) + 1 })
    }

    render() {
        return (
            <form onSubmit={this.onSubmitHandler} className="content-view-pf-pagination table-view-pf-pagination clearfix">
                <div className="form-group">
                    Your search returned {this.state.totalItem} results |
                    <span>
                        <span className="pagination-pf-items-current">{this.state.startingItem} - {this.state.endingItem}</span>
                    </span>
                    <ul className="pagination pagination-pf-back">
                        <li className={this.state.currentPage === 1 ? 'disabled' : ''} onClick={this.firstPageHandler}>
                            <a href="#" title="First Page"><span aria-hidden="true" className="fa fa-angle-double-left i"></span></a>
                        </li>
                        <li className={this.state.currentPage === 1 ? 'disabled' : ''} onClick={this.previousPageHandler}>
                            <a href="#" title="Previous Page"><span aria-hidden="true" className="fa fa-angle-left i"></span></a>
                        </li>
                    </ul>
                    <label className="sr-only control-label">Current Page</label>
                    <input type="number" className="pagination-pf-page form-control" value={this.state.currentPage} onChange={this.inputPageNumberHandler} />
                    <span>
                        &nbsp;of&nbsp;<span className="pagination-pf-pages">4</span>
                    </span>
                    <ul className="pagination pagination-pf-forward">
                        <li className={this.state.currentPage === this.state.numberOfPages ? 'disabled' : ''} onClick={this.nextPageHandler}>
                            <a href="#" title="Next Page">
                                <span aria-hidden="true" className="fa fa-angle-right i"></span>
                            </a>
                        </li>
                        <li className={this.state.currentPage === this.state.numberOfPages ? 'disabled' : ''} onClick={this.lastPageHandler}>
                            <a href="#" title="Last Page">
                                <span aria-hidden="true" className="fa fa-angle-double-right i"></span>
                            </a>
                        </li>
                    </ul>
                </div>
            </form>
        )
    }
}
