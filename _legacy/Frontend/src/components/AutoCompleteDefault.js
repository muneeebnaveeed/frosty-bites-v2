import React, { Component } from 'react';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';

export class Autocomplete extends Component {
    static propTypes = {
        suggestions: PropTypes.instanceOf(Array),
    };
    static defaultProperty = {
        suggestions: [],
    };
    constructor(props) {
        super(props);
        this.state = {
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: '',
        };
    }

    onChange = (e) => {
        const { suggestions } = this.props;
        const userInput = e.currentTarget.value;

        // const filteredSuggestions = suggestions.filter(
        //     (suggestion) => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        // );

        console.log(suggestions.filter());

        // this.setState({
        //     activeSuggestion: 0,
        //     filteredSuggestions,
        //     showSuggestions: true,
        //     userInput: e.currentTarget.value,
        // });
    };

    onClick = (e) => {
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: e.currentTarget.innerText,
        });
    };
    onKeyDown = (e) => {
        const { activeSuggestion, filteredSuggestions } = this.state;

        if (e.keyCode === 13) {
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                userInput: filteredSuggestions[activeSuggestion],
            });
        } else if (e.keyCode === 38) {
            if (activeSuggestion === 0) {
                return;
            }

            this.setState({ activeSuggestion: activeSuggestion - 1 });
        } else if (e.keyCode === 40) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({ activeSuggestion: activeSuggestion + 1 });
        }
    };

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: { activeSuggestion, filteredSuggestions, showSuggestions, userInput },
        } = this;
        let suggestionsListComponent;
        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <Table className="mb-0">
                        <tbody>
                            {filteredSuggestions.map((suggestion, index) => {
                                let className;

                                if (index === activeSuggestion) {
                                    className = '';
                                }

                                return (
                                    <tr style={{ cursor: 'pointer' }} key={suggestion} onClick={onClick}>
                                        <td>{suggestion}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                );
            } else {
                const { userInput } = this.state;
                console.log(userInput);
                suggestionsListComponent = (
                    <div class="no-suggestions">
                        <em>No Existing Products Found! Add '{userInput}'</em>
                    </div>
                );
            }
        }

        return (
            <React.Fragment>
                <input type="search" onChange={onChange} onKeyDown={onKeyDown} value={userInput} />

                {suggestionsListComponent}
            </React.Fragment>
        );
    }
}

export default Autocomplete;
