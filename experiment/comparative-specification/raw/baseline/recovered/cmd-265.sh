date -u +"%Y-%m-%dT%H:%M:%SZ" && mkdir -p /home/ubuntu/tower-spec-output/revisions/v2-after-seat-and-guidelines && cp -a /home/ubuntu/tower-spec-output/SPEC /home/ubuntu/tower-spec-output/revisions/v2-after-seat-and-guidelines/ && {
  echo "# Tower intended-product specification"
  echo
  echo "Concatenated bundle. Source SHA \`c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7\`."
  echo "Primary files live in \`SPEC/\`. This file is the return bundle."
  echo
  echo "---"
  echo
  for f in \
    /home/ubuntu/tower-spec-output/SPEC/00-HOW-TO-READ.md \
    /home/ubuntu/tower-spec-output/SPEC/01-IDENTITY.md \
    /home/ubuntu/tower-spec-output/SPEC/02-ACTORS-AND-DESKS.md \
    /home/ubuntu/tower-spec-output/SPEC/03-CORE-LOOP-AND-SYSTEMS.md \
    /home/ubuntu/tower-spec-output/SPEC/04-CONSULTANT-DESK.md \
    /home/ubuntu/tower-spec-output/SPEC/05-OPERATOR-DESK.md \
    /home/ubuntu/tower-spec-output/SPEC/06-CONTACT-EXPERIENCE.md \
    /home/ubuntu/tower-spec-output/SPEC/07-AGENTS.md \
    /home/ubuntu/tower-spec-output/SPEC/08-AUTOMATIONS.md \
    /home/ubuntu/tower-spec-output/SPEC/09-ELIGIBILITY-AND-MOTION.md \
    /home/ubuntu/tower-spec-output/SPEC/10-DATA-AND-RUNTIME.md \
    /home/ubuntu/tower-spec-output/SPEC/11-CONSTRAINTS.md \
    /home/ubuntu/tower-spec-output/SPEC/12-GLOSSARY.md \
    /home/ubuntu/tower-spec-output/SPEC/13-UNCERTAINTY.md
  do
    echo
    echo
    cat "$f"
    echo
    echo
    echo "-----"
  done
} > /home/ubuntu/tower-spec-output/BUNDLE.md && find /home/ubuntu/tower-spec-output -type f | sort