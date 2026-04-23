import handler from './handler'
import { CONFIG } from './const'

export { type ListCommandArgs } from './types'
export { handler }
export default {
  ...CONFIG,
  handler
}
