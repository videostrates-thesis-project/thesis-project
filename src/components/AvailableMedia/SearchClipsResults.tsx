import { SearchVideosResponse } from "../../services/api/apiTypes"
import SearchSingleClipResults from "./SearchSingleClipResults"

const SearchClipsResults = (props: {
  results: SearchVideosResponse | null
}) => {
  return (
    <>
      {props.results &&
        Object.entries(props.results).map(([url, results]) => (
          <SearchSingleClipResults key={url} url={url} results={results} />
        ))}
    </>
  )
}
export default SearchClipsResults
