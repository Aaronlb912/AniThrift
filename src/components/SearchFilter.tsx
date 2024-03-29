import React, { useEffect, useState } from "react";
import algoliasearch from "algoliasearch/lite";
import "../css/SearchFilter.css";

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");
const index = client.initIndex("items");

interface FilterBarProps {
  selectedFacets: { [key: string]: string[] };
  handleFacetChange: (updatedFacets: { [key: string]: string[] }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedFacets,
  handleFacetChange,
}) => {
  const [facets, setFacets] = useState<{ [key: string]: string[] }>({});
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [animeTagSearchQuery, setAnimeTagSearchQuery] = useState("");

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const response = await index.search("", {
          facets: ["*"],
          facetFilters: [["listingStatus:Selling"]], // Filter for items with a "Selling" status, adjust based on your data structure
          hitsPerPage: 0,
        });
        const facetNames = Object.keys(response.facets || {}).sort();
        const facetPromises = facetNames.map(async (facet) => {
          // Ensure that the search for facet values also respects the "Selling" status filter if needed
          const res = await index.searchForFacetValues(facet, "", {
            filters: "listingStatus:Selling", // Adjust based on your indexing service and data structure
          });
          return { [facet]: res.facetHits.map((hit) => hit.value) };
        });
        const facetValues = await Promise.all(facetPromises);
        setFacets(facetValues.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
      } catch (err) {
        console.error(err);
      }
    };

    fetchFacets();
  }, []);

  const updateFacetSelection = (facet: string, value: string) => {
    const currentSelections = selectedFacets[facet] || [];
    const isSelected = currentSelections.includes(value);
    const newSelections = isSelected
      ? currentSelections.filter((v) => v !== value)
      : [...currentSelections, value];

    handleFacetChange({
      ...selectedFacets,
      [facet]: newSelections,
    });
  };

  const isFacetSelected = (facet: string, value: string) =>
    selectedFacets[facet]?.includes(value);

  const toggleDropdown = (facetName: string) => {
    setOpenDropdowns((currentOpenDropdowns) => {
      const newOpenDropdowns = new Set(currentOpenDropdowns);
      if (newOpenDropdowns.has(facetName)) {
        newOpenDropdowns.delete(facetName);
      } else {
        newOpenDropdowns.add(facetName);
      }
      return newOpenDropdowns;
    });
  };

  return (
    <div className="filter-bar">
      {Object.keys(facets).map((facet) => (
        <div key={facet}>
          <div
            className="filter-by-title"
            onClick={() => toggleDropdown(facet)}
          >
            Filter by {facet.charAt(0).toUpperCase() + facet.slice(1)}
          </div>
          {openDropdowns.has(facet) && (
            <div className="dropdown">
              {facet === "tags" ? (
                <>
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                  />
                  {/* Only display the list if the user has started typing */}
                  {tagSearchQuery && (
                    <div className="tag-options">
                      {facets[facet]
                        .filter((value) =>
                          value
                            .toLowerCase()
                            .includes(tagSearchQuery.toLowerCase())
                        )
                        .map((value) => (
                          <div key={value} className="option">
                            <input
                              type="checkbox"
                              id={`tag-${value}`}
                              checked={isFacetSelected("tags", value)}
                              onChange={() =>
                                updateFacetSelection("tags", value)
                              }
                            />
                            <label htmlFor={`tag-${value}`}>{value}</label>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : facet === "animeTags" ? (
                <>
                  <input
                    type="text"
                    placeholder="Search anime tags..."
                    value={animeTagSearchQuery}
                    onChange={(e) => setAnimeTagSearchQuery(e.target.value)}
                  />
                  {animeTagSearchQuery && (
                    <div className="tag-options">
                      {facets[facet]
                        .filter((value) =>
                          value
                            .toLowerCase()
                            .includes(animeTagSearchQuery.toLowerCase())
                        )
                        .map((value) => (
                          <div key={value} className="option">
                            <input
                              type="checkbox"
                              id={`animeTag-${value}`}
                              checked={isFacetSelected("animeTags", value)}
                              onChange={() =>
                                updateFacetSelection("animeTags", value)
                              }
                            />
                            <label htmlFor={`animeTag-${value}`}>{value}</label>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                facets[facet].map((value) => (
                  <div key={value} className="option">
                    <input
                      type="checkbox"
                      id={`${facet}-${value}`}
                      checked={isFacetSelected(facet, value)}
                      onChange={() => updateFacetSelection(facet, value)}
                    />
                    <label htmlFor={`${facet}-${value}`}>{value}</label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
