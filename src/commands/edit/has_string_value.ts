import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

/**
 * Returns true when the argument is a defined, non-empty string.
 */
const hasStringValue = (value?: string): value is string => {
  return !_isUndefined(value) && !_isEmpty(value)
}

export default hasStringValue
