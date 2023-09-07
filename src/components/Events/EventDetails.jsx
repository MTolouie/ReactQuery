import { Link, useNavigate, Outlet, useParams } from "react-router-dom";
import Modal from "../UI/Modal";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { Fragment, useState } from "react";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { eventId: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isPending: isMutationPending,
    isError: isMutationError,
    error: mutationError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: "events",
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const deleteEventHandler = (event) => {
    mutate({ id: id });
  };

  const startDeleting = () => {
    setIsDeleting(true);
  };

  const stopDeleting = () => {
    setIsDeleting(false);
  };

  return (
    <>
      <Outlet />
      {isDeleting && (
        <Modal onClose={stopDeleting}>
          <h2>Are You Sure ?</h2>
          <p>Do You really Want To Delete This Event ? </p>
          <div className="form-actions">
            {isMutationPending && <p>Deletion Is In The Proccess...</p>}
            {!isMutationPending && (
              <Fragment>
                <button onClick={stopDeleting} className="button-text">
                  Cancel
                </button>
                <button onClick={deleteEventHandler} className="button">
                  Delete
                </button>
              </Fragment>
            )}
          </div>
          {isMutationError && (
            <ErrorBlock
              title="An Error Occurred"
              message={mutationError.info?.message}
            />
          )}
        </Modal>
      )}
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {isPending && (
        <div id="event-details-content" className="center">
          <LoadingIndicator />
        </div>
      )}

      {isError && (
        <div id="event-details-content" className="center">
          <ErrorBlock
            title="Could Not Fetch The Data"
            message={error.info?.message}
          />
        </div>
      )}

      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={startDeleting}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {data.date} @ {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
