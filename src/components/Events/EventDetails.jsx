import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../Header.jsx";
import { fetchEvent } from "../../utils/http.js";
import { useMutation } from "@tanstack/react-query";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { deleteEvent, queryClient } from "../../utils/http.js";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  console.log("EventDetails params:", params);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: errorDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });
  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleCancelDelete() {
    setIsDeleting(false);
  }
  function deleteHandler() {
    mutate({ id: params.id });
  }

  let content;
  if (isPending) {
    content = (
      <div id="event-details-content" className="centered">
        <p> Loading event... </p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="centered">
        <ErrorBlock
          title="An error occurred"
          message={(isError && error.info?.message) || "Failed to fetch events"}
        />
      </div>
    );
  }
  if (data) {
    const formmattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formmattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h1>Are you Sure?</h1>
          <p>
            Do you really want to delete this event? This action cannot be
            undone!
          </p>
          {isPendingDeletion && <p>Deleting event...</p>}
          {isErrorDeletion && (
            <ErrorBlock
              title="An error occurred"
              message={
                (isErrorDeletion && errorDeletion.info?.message) ||
                "Failed to delete event"
              }
            />
          )}
          <div className="form-actions">
            {!isPendingDeletion && (
              <>
                <button className="button-text" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="button" onClick={deleteHandler}>
                  Delete
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
