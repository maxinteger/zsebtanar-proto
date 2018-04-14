import { assocPath, pathOr } from 'ramda'
import React from 'react'
import { connect } from 'react-redux'
import { openInputModal } from 'shared/store/actions/modal'
import { MarkdownField } from 'shared/component/userControls/common/MarkdownField'

export const FractionNumberAdmin = connect(undefined, { openInputModal })(
  class extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        prefix: pathOr(null, ['value', 'prefix'], props),
        postfix: pathOr(null, ['value', 'postfix'], props),
        solution: {
          numerator: pathOr(1, ['value', 'solution', 'numerator'], props),
          denominator: pathOr(1, ['value', 'solution', 'denominator'], props)
        }
      }
    }

    editLabel = ({ name, value }) => this.updateState({ [name]: value })

    setSolution = e => {
      const { name, value } = e.currentTarget
      this.updateState(assocPath(['solution', name], value, this.state))
    }

    updateState = data => {
      const state = { ...this.state, ...data }
      this.setState(state)
      if (this.props.onChange) {
        this.props.onChange({ value: state, name: this.props.name })
      }
    }

    render() {
      const { prefix, postfix, solution } = this.state
      return (
        <div className="user-control single-number single-number-admin">
          <MarkdownField
            label="Előtag"
            name="prefix"
            value={prefix}
            placeholder="Üres"
            onChange={this.editLabel}
            resources={this.props.resources}
            cleanable
          />
          <MarkdownField
            label="Utótag"
            name="postfix"
            value={postfix}
            placeholder="Üres"
            onChange={this.editLabel}
            resources={this.props.resources}
            cleanable
          />
          <div className="form-group row">
            <label className="col-3 col-form-label">Számláló:</label>
            <div className="col-7">
              <input
                type="number"
                name="numerator"
                onChange={this.setSolution}
                className="form-control"
                value={solution.numerator}
                step="1"
              />
            </div>
          </div>
          <div className="form-group row">
            <label className="col-3 col-form-label">Nevező:</label>
            <div className="col-7">
              <input
                type="number"
                name="denominator"
                onChange={this.setSolution}
                className="form-control"
                value={solution.denominator}
                step="1"
              />
            </div>
          </div>
        </div>
      )
    }
  }
)